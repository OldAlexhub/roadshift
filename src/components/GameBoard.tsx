import React, { useCallback } from 'react';
import { View } from 'react-native';
import Svg, { Line, Circle, G, Text as SvgText, Rect } from 'react-native-svg';
import { CityMap, MapNode, VehicleDef, RiderDef, VehicleAssignment, VEHICLE_SPECS } from '../types/game';
import { Colors } from '../theme/colors';
import { getNodePosition, dijkstra } from '../engine/routeEngine';

export interface BoardTap {
  nodeId: string;
  riderId?: string;
  stopType?: 'pickup' | 'dropoff';
}

interface Props {
  cityMap: CityMap;
  vehicles: VehicleDef[];
  riders: RiderDef[];
  assignments: VehicleAssignment[];
  selectedVehicleId: string | null;
  onTap: (tap: BoardTap) => void;
  boardWidth: number;
  boardHeight: number;
}

const ROAD_COLORS: Record<string, string> = {
  normal:    '#1e2d45',
  fast:      '#1e3a5f',
  congested: '#7f2020',
  rain_slow: '#1a2a5f',
  closed:    '#3a0808',
  one_way:   '#1e2d45',
};

const VEHICLE_COLORS: Record<string, string> = {
  compact_cab: Colors.vehicleCompact,
  city_van:    Colors.vehicleVan,
  access_van:  Colors.vehicleAccess,
  shuttle:     Colors.vehicleShuttle,
};

const RIDER_COLORS: Record<string, string> = {
  standard:   Colors.riderStandard,
  priority:   Colors.riderPriority,
  accessible: Colors.riderAccessible,
  group:      Colors.riderGroup,
};

const RIDER_LABELS: Record<string, string> = {
  standard:   'P',
  priority:   '!',
  accessible: 'A',
  group:      'G',
};

export default function GameBoard({
  cityMap, vehicles, riders, assignments, selectedVehicleId, onTap, boardWidth, boardHeight,
}: Props) {
  const { rows, cols, nodes, edges } = cityMap;

  const nodePos = useCallback(
    (nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return { x: 0, y: 0 };
      return getNodePosition(node, boardWidth, boardHeight, rows, cols);
    },
    [nodes, boardWidth, boardHeight, rows, cols],
  );

  // Build route overlay segments for all assignments
  const routeSegments: Array<{ x1: number; y1: number; x2: number; y2: number; color: string }> = [];
  for (const assignment of assignments) {
    const vehicle = vehicles.find(v => v.id === assignment.vehicleId);
    if (!vehicle) continue;
    const color = VEHICLE_COLORS[vehicle.type] ?? Colors.routeGlow;
    let current = vehicle.startNodeId;
    for (const stop of assignment.stops) {
      const rider = riders.find(r => r.id === stop.riderId);
      if (!rider) continue;
      const targetNodeId = stop.type === 'pickup' ? rider.pickupNodeId : rider.dropoffNodeId;
      const result = dijkstra(cityMap, current, targetNodeId);
      if (result.found) {
        for (let i = 0; i < result.path.length - 1; i++) {
          const from = nodePos(result.path[i]);
          const to   = nodePos(result.path[i + 1]);
          routeSegments.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, color });
        }
      }
      current = targetNodeId;
    }
  }

  // Which riders have which stops already assigned (for visual feedback)
  const assignedPickups  = new Set<string>();
  const assignedDropoffs = new Set<string>();
  for (const a of assignments) {
    for (const s of a.stops) {
      if (s.type === 'pickup')  assignedPickups.add(s.riderId);
      if (s.type === 'dropoff') assignedDropoffs.add(s.riderId);
    }
  }

  function handlePress(e: any) {
    const { locationX: x, locationY: y } = e.nativeEvent;

    // 1. Check vehicle tap (priority)
    for (const v of vehicles) {
      const pos = nodePos(v.startNodeId);
      if (Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2) < 22) {
        onTap({ nodeId: v.startNodeId });
        return;
      }
    }

    // 2. Check rider DROPOFF tap (small squares at destination)
    for (const r of riders) {
      const pos = nodePos(r.dropoffNodeId);
      if (Math.abs(x - pos.x) < 14 && Math.abs(y - pos.y) < 14) {
        onTap({ nodeId: r.dropoffNodeId, riderId: r.id, stopType: 'dropoff' });
        return;
      }
    }

    // 3. Check rider PICKUP tap (circles at pickup point)
    for (const r of riders) {
      const pos = nodePos(r.pickupNodeId);
      if (Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2) < 18) {
        onTap({ nodeId: r.pickupNodeId, riderId: r.id, stopType: 'pickup' });
        return;
      }
    }

    // 4. Nearest node fallback (to deselect vehicle)
    let closest: MapNode | null = null;
    let closestDist = 28;
    for (const node of nodes) {
      const pos  = getNodePosition(node, boardWidth, boardHeight, rows, cols);
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist < closestDist) { closestDist = dist; closest = node; }
    }
    if (closest) onTap({ nodeId: closest.id });
  }

  return (
    <View style={{ width: boardWidth, height: boardHeight }} onTouchEnd={handlePress}>
      <Svg width={boardWidth} height={boardHeight}>

        {/* Roads */}
        {edges.map(edge => {
          const from = nodePos(edge.from);
          const to   = nodePos(edge.to);
          return (
            <Line key={edge.id}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={ROAD_COLORS[edge.type] ?? ROAD_COLORS.normal}
              strokeWidth={edge.type === 'closed' ? 2 : 3}
              strokeDasharray={edge.type === 'closed' ? '6,4' : undefined}
            />
          );
        })}

        {/* Route overlays */}
        {routeSegments.map((seg, i) => (
          <Line key={`route_${i}`}
            x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
            stroke={seg.color} strokeWidth={5} opacity={0.65}
          />
        ))}

        {/* Intersection dots */}
        {nodes.map(node => {
          const pos = nodePos(node.id);
          return <Circle key={node.id} cx={pos.x} cy={pos.y} r={2.5} fill={Colors.nodeDefault} />;
        })}

        {/* Rider DROPOFF squares (destination) */}
        {riders.map(r => {
          const pos   = nodePos(r.dropoffNodeId);
          const color = RIDER_COLORS[r.type] ?? Colors.riderStandard;
          const done  = assignedDropoffs.has(r.id);
          const half  = 7;
          return (
            <G key={`drop_${r.id}`}>
              <Rect
                x={pos.x - half} y={pos.y - half}
                width={half * 2} height={half * 2}
                rx={2}
                fill={done ? Colors.success : color}
                opacity={done ? 0.9 : 0.55}
              />
              <SvgText x={pos.x} y={pos.y + 3.5} fontSize={7} fontWeight="bold" fill="#fff" textAnchor="middle">
                D
              </SvgText>
            </G>
          );
        })}

        {/* Rider PICKUP circles */}
        {riders.map(r => {
          const pos   = nodePos(r.pickupNodeId);
          const color = RIDER_COLORS[r.type] ?? Colors.riderStandard;
          const done  = assignedPickups.has(r.id);
          return (
            <G key={`pick_${r.id}`}>
              <Circle cx={pos.x} cy={pos.y} r={14} fill={color} opacity={0.18} />
              <Circle cx={pos.x} cy={pos.y} r={10} fill={done ? Colors.success : color} opacity={done ? 0.95 : 0.9} />
              <SvgText x={pos.x} y={pos.y + 4} fontSize={9} fontWeight="bold" fill="#fff" textAnchor="middle">
                {RIDER_LABELS[r.type] ?? 'P'}
              </SvgText>
            </G>
          );
        })}

        {/* Vehicles */}
        {vehicles.map(v => {
          const pos   = nodePos(v.startNodeId);
          const color = VEHICLE_COLORS[v.type] ?? Colors.vehicleCompact;
          const isSelected = v.id === selectedVehicleId;
          return (
            <G key={v.id}>
              {isSelected && <Circle cx={pos.x} cy={pos.y} r={20} fill={color} opacity={0.2} />}
              <Circle cx={pos.x} cy={pos.y} r={13} fill={color} />
              <Circle cx={pos.x} cy={pos.y} r={13} fill="none" stroke={isSelected ? '#fff' : color} strokeWidth={isSelected ? 2.5 : 1.5} />
              <SvgText x={pos.x} y={pos.y + 4} fontSize={8} fontWeight="bold" fill="#fff" textAnchor="middle">
                {v.type === 'compact_cab' ? 'CAB' : v.type === 'city_van' ? 'VAN' : v.type === 'access_van' ? 'ACC' : 'SHT'}
              </SvgText>
            </G>
          );
        })}

      </Svg>
    </View>
  );
}
