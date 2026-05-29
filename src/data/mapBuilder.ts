import { CityMap, MapNode, MapEdge, RoadType } from '../types/game';

type GridEdge = [string, string, RoadType];

export function buildGridMap(
  rows: number,
  cols: number,
  extraEdges: GridEdge[] = [],
  removedEdges: Array<[string, string]> = [],
  roadOverrides: Array<[string, string, RoadType]> = [],
): CityMap {
  const nodes: MapNode[] = [];
  const edges: MapEdge[]  = [];
  let edgeCounter = 0;

  const id = (r: number, c: number) => `${r}_${c}`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      nodes.push({ id: id(r, c), row: r, col: c });
    }
  }

  const removedSet = new Set(
    removedEdges.map(([a, b]) => `${a}|${b}`).concat(removedEdges.map(([a, b]) => `${b}|${a}`)),
  );

  const overrideMap = new Map<string, RoadType>();
  for (const [a, b, t] of roadOverrides) {
    overrideMap.set(`${a}|${b}`, t);
    overrideMap.set(`${b}|${a}`, t);
  }

  const addEdge = (from: string, to: string, defaultType: RoadType = 'normal') => {
    const key1 = `${from}|${to}`;
    const key2 = `${to}|${from}`;
    if (removedSet.has(key1)) return;
    const type = overrideMap.get(key1) ?? overrideMap.get(key2) ?? defaultType;
    edges.push({ id: `e${edgeCounter++}`, from, to, type });
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      addEdge(id(r, c), id(r, c + 1));
    }
  }

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      addEdge(id(r, c), id(r + 1, c));
    }
  }

  for (const [from, to, type] of extraEdges) {
    edges.push({ id: `e${edgeCounter++}`, from, to, type });
  }

  return { rows, cols, nodes, edges };
}

export const N = (r: number, c: number) => `${r}_${c}`;
