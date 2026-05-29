import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { Line, Circle, G, Text as SvgText } from 'react-native-svg';
import { CityMap, MapNode, VehicleDef, RiderDef, VehicleAssignment, VEHICLE_SPECS } from '../types/game';
import { Colors } from '../theme/colors';
import { getNodePosition, dijkstra } from '../engine/routeEngine';

interface Props {
  cityMap: CityMap;
  vehicles: VehicleDef[];
  riders: RiderDef[];
  assignments: VehicleAssignment[];
  selectedVehicleId: string | null;
  onNodeTap: (nodeId: string) => void;
  onVehicleTap: (vehicleId: string) => void;
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
  cityMap, vehicles, riders, assignments, selectedVehicleId,
  onNodeTap, onVehicleTap, boardWidth, boardHeight,
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

  // Build route paths for all assignments
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

  const selectedAssignment = assignments.find(a => a.vehicleId === selectedVehicleId);
  const assignedRiderIds = new Set(selectedAssignment?.stops.map(s => s.riderId) ?? []);

  function handleBoardPress(e: any) {
    const { locationX: x, locationY: y } = e.nativeEvent;

    // Check vehicle tap first
    for (const v of vehicles) {
      const pos = nodePos(v.startNodeId);
      if (Math.abs(x - pos.x) < 22 && Math.abs(y - pos.y) < 22) {
        onVehicleTap(v.id);
        return;
      }
    }

    // Check rider pickup tap
    for (const r of riders) {
      const pos = nodePos(r.pickupNodeId);
      if (Math.abs(x - pos.x) < 20 && Math.abs(y - pos.y) < 20) {
        onNodeTap(r.pickupNodeId);
        return;
      }
    }

    // Find closest node
    let closest: MapNode | null = null;
    let closestDist = 28;
    for (const node of nodes) {
      const pos = getNodePosition(node, boardWidth, boardHeight, rows, cols);
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist < closestDist) {
        closestDist = dist;
        closest = node;
      }
    }
    if (closest) onNodeTap(closest.id);
  }

  return (
    <View style={{ width: boardWidth, height: boardHeight }} onTouchEnd={handleBoardPress}>
      <Svg width={boardWidth} height={boardHeight}>
        {/* Roads */}
        {edges.map(edge => {
          const from = nodePos(edge.from);
          const to   = nodePos(edge.to);
          return (
            <Line
              key={edge.id}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={ROAD_COLORS[edge.type] ?? ROAD_COLORS.normal}
              strokeWidth={edge.type === 'closed' ? 2 : 3}
              strokeDasharray={edge.type === 'closed' ? '6,4' : undefined}
            />
          );
        })}

        {/* Route overlays */}
        {routeSegments.map((seg, i) => (
          <Line
            key={`route_${i}`}
            x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
            stroke={seg.color}
            strokeWidth={5}
            opacity={0.7}
          />
        ))}

        {/* Intersection nodes */}
        {nodes.map(node => {
          const pos = nodePos(node.id);
          return (
            <Circle
              key={node.id}
              cx={pos.x} cy={pos.y} r={3}
              fill={Colors.nodeDefault}
            />
          );
        })}

        {/* Rider pickup markers */}
        {riders.map(r => {
          const pickupPos  = nodePos(r.pickupNodeId);
          const dropoffPos = nodePos(r.dropoffNodeId);
          const color    = RIDER_COLORS[r.type] ?? Colors.riderStandard;
          const label    = RIDER_LABELS[r.type] ?? 'P';
          const isAssigned = assignedRiderIds.has(r.id);

          return (
            <G key={r.id}>
              {/* Pickup - larger, pulsing appearance */}
              <Circle cx={pickupPos.x} cy={pickupPos.y} r={12} fill={color} opacity={0.2} />
              <Circle cx={pickupPos.x} cy={pickupPos.y} r={8}  fill={isAssigned ? Colors.success : color} />
              <SvgText
                x={pickupPos.x} y={pickupPos.y + 4}
                fontSize={8} fontWeight="bold"
                fill="#fff" textAnchor="middle"
              >
                {label}
              </SvgText>

              {/* Dropoff - smaller diamond */}
              <Circle cx={dropoffPos.x} cy={dropoffPos.y} r={5} fill={color} opacity={0.6} />
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
              {isSelected && (
                <Circle cx={pos.x} cy={pos.y} r={18} fill={color} opacity={0.25} />
              )}
              <Circle cx={pos.x} cy={pos.y} r={13} fill={color} />
              <Circle cx={pos.x} cy={pos.y} r={13} fill="none" stroke={isSelected ? '#fff' : color} strokeWidth={2} />
              <SvgText
                x={pos.x} y={pos.y + 4}
                fontSize={8} fontWeight="bold"
                fill="#fff" textAnchor="middle"
              >
                {v.type === 'compact_cab' ? 'CAB' : v.type === 'city_van' ? 'VAN' : v.type === 'access_van' ? 'ACC' : 'SHT'}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
