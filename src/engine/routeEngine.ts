import { CityMap, MapNode, MapEdge, ROAD_COST } from '../types/game';

export interface PathResult {
  found: boolean;
  path: string[];
  cost: number;
}

function buildAdjacency(map: CityMap): Map<string, Array<{ to: string; cost: number; edgeId: string }>> {
  const adj = new Map<string, Array<{ to: string; cost: number; edgeId: string }>>();

  for (const node of map.nodes) {
    adj.set(node.id, []);
  }

  for (const edge of map.edges) {
    const cost = ROAD_COST[edge.type];
    if (cost === Infinity) continue;

    const fromList = adj.get(edge.from);
    const toList   = adj.get(edge.to);

    if (fromList && edge.oneWayDirection !== 'reverse') {
      fromList.push({ to: edge.to, cost, edgeId: edge.id });
    }
    if (toList && edge.oneWayDirection !== 'forward') {
      toList.push({ to: edge.from, cost, edgeId: edge.id });
    }
  }

  return adj;
}

export function dijkstra(map: CityMap, startId: string, endId: string): PathResult {
  if (startId === endId) return { found: true, path: [startId], cost: 0 };

  const adj = buildAdjacency(map);
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();

  for (const node of map.nodes) {
    dist.set(node.id, Infinity);
    prev.set(node.id, null);
  }
  dist.set(startId, 0);

  const queue: Array<{ id: string; cost: number }> = [{ id: startId, cost: 0 }];

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const { id: current } = queue.shift()!;

    if (visited.has(current)) continue;
    visited.add(current);

    if (current === endId) break;

    const neighbors = adj.get(current) ?? [];
    for (const { to, cost } of neighbors) {
      if (visited.has(to)) continue;
      const newDist = (dist.get(current) ?? Infinity) + cost;
      if (newDist < (dist.get(to) ?? Infinity)) {
        dist.set(to, newDist);
        prev.set(to, current);
        queue.push({ id: to, cost: newDist });
      }
    }
  }

  const endDist = dist.get(endId) ?? Infinity;
  if (endDist === Infinity) return { found: false, path: [], cost: Infinity };

  const path: string[] = [];
  let current: string | null = endId;
  while (current !== null) {
    path.unshift(current);
    current = prev.get(current) ?? null;
  }

  return { found: true, path, cost: endDist };
}

export function getNodePosition(node: MapNode, boardWidth: number, boardHeight: number, rows: number, cols: number) {
  const paddingX = boardWidth  * 0.08;
  const paddingY = boardHeight * 0.08;
  const usableW  = boardWidth  - paddingX * 2;
  const usableH  = boardHeight - paddingY * 2;

  const x = paddingX + (node.col / Math.max(cols - 1, 1)) * usableW;
  const y = paddingY + (node.row / Math.max(rows - 1, 1)) * usableH;

  return { x, y };
}

export function findNodeAt(
  px: number,
  py: number,
  nodes: MapNode[],
  boardWidth: number,
  boardHeight: number,
  rows: number,
  cols: number,
  radius: number = 28,
): MapNode | null {
  let closest: MapNode | null = null;
  let closestDist = radius;

  for (const node of nodes) {
    const { x, y } = getNodePosition(node, boardWidth, boardHeight, rows, cols);
    const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
    if (dist < closestDist) {
      closestDist = dist;
      closest = node;
    }
  }

  return closest;
}
