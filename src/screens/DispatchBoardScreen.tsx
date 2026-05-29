import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { getLevel } from '../data/levels';
import {
  VehicleAssignment, Stop, PlayerPlan, VEHICLE_SPECS,
} from '../types/game';
import { validateAndSimulate } from '../engine/scoringEngine';
import GameBoard from '../components/GameBoard';

type Props = NativeStackScreenProps<RootStackParamList, 'DispatchBoard'>;

const RIDER_ICONS: Record<string, string> = {
  standard: 'P', priority: '!', accessible: 'A', group: 'G',
};

export default function DispatchBoardScreen({ navigation, route }: Props) {
  const { levelId } = route.params;
  const levelMaybe = getLevel(levelId);
  const { width, height } = useWindowDimensions();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<VehicleAssignment[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const boardHeight = Math.min(height * 0.48, 340);
  const boardWidth  = width - 32;

  if (!levelMaybe) {
    return (
      <View style={styles.container}>
        <Text style={{ color: Colors.danger }}>Level not found</Text>
      </View>
    );
  }

  const level = levelMaybe;

  function getAssignment(vehicleId: string): VehicleAssignment {
    return assignments.find(a => a.vehicleId === vehicleId) ?? { vehicleId, stops: [] };
  }

  function setAssignment(vehicleId: string, stops: Stop[]) {
    setAssignments(prev => {
      const others = prev.filter(a => a.vehicleId !== vehicleId);
      if (stops.length === 0) return others;
      return [...others, { vehicleId, stops }];
    });
  }

  function getCapacityUsed(vehicleId: string): number {
    const assignment = getAssignment(vehicleId);
    const onboard: string[] = [];
    let max = 0;
    let current = 0;
    for (const stop of assignment.stops) {
      const rider = level.riders.find(r => r.id === stop.riderId);
      if (!rider) continue;
      if (stop.type === 'pickup') {
        current += rider.capacityUsed;
        max = Math.max(max, current);
        onboard.push(rider.id);
      } else {
        current -= rider.capacityUsed;
      }
    }
    return max;
  }

  function handleVehicleTap(vehicleId: string) {
    setSelectedVehicleId(prev => prev === vehicleId ? null : vehicleId);
    setValidationError(null);
  }

  function handleNodeTap(nodeId: string) {
    if (!selectedVehicleId) return;

    const vehicle = level.vehicles.find(v => v.id === selectedVehicleId);
    if (!vehicle) return;
    const spec = VEHICLE_SPECS[vehicle.type];

    const riderAtPickup  = level.riders.find(r => r.pickupNodeId  === nodeId);
    const riderAtDropoff = level.riders.find(r => r.dropoffNodeId === nodeId);

    const assignment = getAssignment(selectedVehicleId);
    const alreadyPickedUp = assignment.stops.some(s => s.riderId === riderAtPickup?.id && s.type === 'pickup');
    const hasBeenDroppedOff = assignment.stops.some(s => s.riderId === riderAtDropoff?.id && s.type === 'dropoff');

    if (riderAtPickup && !alreadyPickedUp) {
      // Accessibility check
      if (riderAtPickup.type === 'accessible' && !spec.accessible) {
        setValidationError(`${riderAtPickup.id}: Needs an Access Van`);
        return;
      }
      // Capacity check (rough - check current max)
      const newStops: Stop[] = [
        ...assignment.stops,
        { type: 'pickup',  riderId: riderAtPickup.id, nodeId },
        { type: 'dropoff', riderId: riderAtPickup.id, nodeId: riderAtPickup.dropoffNodeId },
      ];
      let onboard: string[] = [];
      let current = 0;
      let exceeded = false;
      for (const stop of newStops) {
        const r = level.riders.find(rx => rx.id === stop.riderId);
        if (!r) continue;
        if (stop.type === 'pickup') {
          current += r.capacityUsed;
          if (current > spec.capacity) { exceeded = true; break; }
          onboard.push(r.id);
        } else {
          current -= r.capacityUsed;
        }
      }
      if (exceeded) {
        setValidationError(`${spec.label} capacity would be exceeded`);
        return;
      }
      setAssignment(selectedVehicleId, newStops);
      setValidationError(null);
    } else if (riderAtDropoff && !hasBeenDroppedOff) {
      setValidationError(`Tap the rider pickup point first`);
    }
  }

  function removeRider(vehicleId: string, riderId: string) {
    const assignment = getAssignment(vehicleId);
    const newStops = assignment.stops.filter(s => s.riderId !== riderId);
    setAssignment(vehicleId, newStops);
    setValidationError(null);
  }

  function resetPlan() {
    setAssignments([]);
    setSelectedVehicleId(null);
    setValidationError(null);
  }

  const allRidersAssigned = (() => {
    const assignedRiders = new Set(assignments.flatMap(a => a.stops.map(s => s.riderId)));
    return level.riders.every(r => assignedRiders.has(r.id));
  })();

  function handleStartShift() {
    if (!allRidersAssigned) {
      setValidationError('Assign all riders before starting');
      return;
    }

    const plan: PlayerPlan = { assignments };
    const result = validateAndSimulate(level, plan);

    if (!result.valid) {
      setValidationError(result.errorMessage ?? 'Invalid plan');
      return;
    }

    navigation.navigate('LiveShift', { levelId, result });
  }

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Exit Level', 'Your plan will be lost.', [
                  { text: 'Cancel',       style: 'cancel' },
                  { text: 'Level Select', onPress: () => navigation.goBack() },
                  { text: 'Home',         onPress: () => navigation.navigate('Home') },
                ])
              }
            >
              <Text style={styles.backText}>{'< Exit'}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Level {levelId}: {level.name}</Text>
            <TouchableOpacity onPress={resetPlan}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {validationError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          )}

          {selectedVehicleId && (
            <View style={styles.hint}>
              <Text style={styles.hintText}>
                Tap a rider (P/!/A/G) to assign. Tap background to deselect.
              </Text>
            </View>
          )}

          <View style={styles.boardContainer}>
            <GameBoard
              cityMap={level.cityMap}
              vehicles={level.vehicles}
              riders={level.riders}
              assignments={assignments}
              selectedVehicleId={selectedVehicleId}
              onNodeTap={handleNodeTap}
              onVehicleTap={handleVehicleTap}
              boardWidth={boardWidth}
              boardHeight={boardHeight}
            />
          </View>

          <View style={styles.legend}>
            <Text style={styles.legendItem}>P=Standard  !=Priority  A=Accessible  G=Group</Text>
            {level.cityMap.edges.some(e => e.type === 'congested') && <Text style={styles.legendItem}>Red roads: congested</Text>}
            {level.cityMap.edges.some(e => e.type === 'rain_slow') && <Text style={styles.legendItem}>Blue roads: rain-slowed</Text>}
            {level.cityMap.edges.some(e => e.type === 'closed')    && <Text style={styles.legendItem}>Dark roads: closed</Text>}
          </View>

          <ScrollView style={styles.assignmentPanel} contentContainerStyle={{ padding: 12, gap: 10 }}>
            {level.vehicles.map(v => {
              const spec       = VEHICLE_SPECS[v.type];
              const assignment = getAssignment(v.id);
              const capUsed    = getCapacityUsed(v.id);
              const isSelected = v.id === selectedVehicleId;

              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vehicleCard, isSelected && styles.vehicleCardSelected]}
                  onPress={() => handleVehicleTap(v.id)}
                >
                  <View style={styles.vehicleCardHeader}>
                    <Text style={styles.vehicleCardName}>{spec.label}</Text>
                    <Text style={styles.vehicleCardCap}>
                      {capUsed}/{spec.capacity} {spec.accessible ? '(Accessible)' : ''}
                    </Text>
                  </View>
                  {assignment.stops.filter(s => s.type === 'pickup').map(stop => {
                    const rider = level.riders.find(r => r.id === stop.riderId);
                    if (!rider) return null;
                    return (
                      <View key={stop.riderId} style={styles.riderRow}>
                        <Text style={styles.riderRowText}>
                          {RIDER_ICONS[rider.type]} {rider.type} {rider.deadline ? `(deadline: ${rider.deadline}s)` : ''}
                        </Text>
                        <TouchableOpacity onPress={() => removeRider(v.id, rider.id)}>
                          <Text style={styles.removeBtn}>x</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  {assignment.stops.length === 0 && (
                    <Text style={styles.noAssignment}>Tap vehicle, then tap riders on map to assign</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>

        <SafeAreaView edges={['bottom']}>
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.startBtn, !allRidersAssigned && styles.startBtnDisabled]}
              onPress={handleStartShift}
            >
              <Text style={styles.startBtnText}>
                {allRidersAssigned ? 'START SHIFT' : `Assign ${level.riders.length - assignments.flatMap(a => a.stops.filter(s => s.type === 'pickup')).length} more rider(s)`}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:              { flex: 1 },
  container:         { flex: 1, backgroundColor: Colors.background },
  safe:              { flex: 1 },
  header:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backText:          { color: Colors.primary, fontSize: 14 },
  headerTitle:       { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1, textAlign: 'center' },
  resetText:         { color: Colors.warning, fontSize: 14 },
  errorBanner:       { backgroundColor: Colors.danger + '33', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.danger + '55' },
  errorText:         { color: Colors.danger, fontSize: 13 },
  hint:              { backgroundColor: Colors.primary + '22', paddingHorizontal: 16, paddingVertical: 6 },
  hintText:          { color: Colors.primaryLight, fontSize: 12 },
  boardContainer:    { alignItems: 'center', paddingHorizontal: 16, backgroundColor: Colors.mapBackground, paddingVertical: 8 },
  legend:            { paddingHorizontal: 16, paddingVertical: 4, gap: 2 },
  legendItem:        { fontSize: 10, color: Colors.textMuted },
  assignmentPanel:   { flex: 1 },
  vehicleCard:       { backgroundColor: Colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  vehicleCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.surfaceAlt },
  vehicleCardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  vehicleCardName:   { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  vehicleCardCap:    { fontSize: 12, color: Colors.textMuted },
  riderRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surfaceAlt, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  riderRowText:      { fontSize: 13, color: Colors.textSecondary },
  removeBtn:         { color: Colors.danger, fontSize: 16, fontWeight: '700', paddingHorizontal: 4 },
  noAssignment:      { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' },
  footer:            { padding: 12 },
  startBtn:          { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  startBtnDisabled:  { backgroundColor: Colors.surfaceAlt },
  startBtnText:      { color: '#fff', fontSize: 16, fontWeight: '700' },
});
