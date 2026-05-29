import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { getLevel } from '../data/levels';
import { VehicleAssignment, Stop, PlayerPlan, VEHICLE_SPECS } from '../types/game';
import { validateAndSimulate } from '../engine/scoringEngine';
import GameBoard, { BoardTap } from '../components/GameBoard';

type Props = NativeStackScreenProps<RootStackParamList, 'DispatchBoard'>;

const STOP_ICONS: Record<string, string> = {
  standard_pickup:   'P',
  priority_pickup:   '!',
  accessible_pickup: 'A',
  group_pickup:      'G',
};

const RIDER_TYPE_LABELS: Record<string, string> = {
  standard: 'Standard', priority: 'Priority', accessible: 'Accessible', group: 'Group',
};

export default function DispatchBoardScreen({ navigation, route }: Props) {
  const { levelId } = route.params;
  const levelMaybe = getLevel(levelId);
  const { width, height } = useWindowDimensions();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<VehicleAssignment[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const boardHeight = Math.min(height * 0.46, 340);
  const boardWidth  = width - 32;

  if (!levelMaybe) {
    return (
      <View style={styles.container}>
        <Text style={{ color: Colors.danger, padding: 20 }}>Level not found</Text>
      </View>
    );
  }
  const level = levelMaybe;

  function getAssignment(vehicleId: string): VehicleAssignment {
    return assignments.find(a => a.vehicleId === vehicleId) ?? { vehicleId, stops: [] };
  }

  function updateAssignment(vehicleId: string, stops: Stop[]) {
    setAssignments(prev => {
      const others = prev.filter(a => a.vehicleId !== vehicleId);
      if (stops.length === 0) return others;
      return [...others, { vehicleId, stops }];
    });
  }

  // Returns the current peak capacity used by a vehicle in a stop sequence
  function peakCapacity(stops: Stop[]): number {
    let current = 0, max = 0;
    for (const stop of stops) {
      const rider = level.riders.find(r => r.id === stop.riderId);
      if (!rider) continue;
      if (stop.type === 'pickup')  current += rider.capacityUsed;
      if (stop.type === 'dropoff') current -= rider.capacityUsed;
      if (current > max) max = current;
    }
    return max;
  }

  function handleBoardTap(tap: BoardTap) {
    const { nodeId, riderId, stopType } = tap;

    // If no rider info, this is a vehicle tap or blank tap
    if (!riderId || !stopType) {
      // Check if it matches a vehicle position
      const tappedVehicle = level.vehicles.find(v => v.startNodeId === nodeId);
      if (tappedVehicle) {
        setSelectedVehicleId(prev => prev === tappedVehicle.id ? null : tappedVehicle.id);
      } else {
        setSelectedVehicleId(null);
      }
      setValidationError(null);
      return;
    }

    // Must have a vehicle selected
    if (!selectedVehicleId) {
      setValidationError('Tap a vehicle first, then tap pickup (P) or dropoff (D) markers.');
      return;
    }

    const vehicle = level.vehicles.find(v => v.id === selectedVehicleId);
    if (!vehicle) return;
    const spec  = VEHICLE_SPECS[vehicle.type];
    const rider = level.riders.find(r => r.id === riderId);
    if (!rider) return;

    const assignment = getAssignment(selectedVehicleId);

    if (stopType === 'pickup') {
      // Prevent duplicate pickup for this vehicle
      if (assignment.stops.some(s => s.riderId === riderId && s.type === 'pickup')) {
        setValidationError(`${RIDER_TYPE_LABELS[rider.type]} rider pickup already added to this vehicle.`);
        return;
      }
      // Accessibility check
      if (rider.type === 'accessible' && !spec.accessible) {
        setValidationError(`This vehicle is not accessible. Use an Access Van for accessible riders.`);
        return;
      }
      // Capacity check: simulate adding this pickup
      const testStops: Stop[] = [
        ...assignment.stops,
        { type: 'pickup', riderId: rider.id, nodeId: rider.pickupNodeId },
      ];
      if (peakCapacity(testStops) > spec.capacity) {
        setValidationError(`${spec.label} is full (capacity ${spec.capacity}). Cannot add more riders.`);
        return;
      }
      // Add pickup stop
      const newStops: Stop[] = [
        ...assignment.stops,
        { type: 'pickup', riderId: rider.id, nodeId: rider.pickupNodeId },
      ];
      updateAssignment(selectedVehicleId, newStops);
      setValidationError(null);

    } else {
      // stopType === 'dropoff'
      // Must have picked up this rider first on this vehicle
      const pickedUp = assignment.stops.some(s => s.riderId === riderId && s.type === 'pickup');
      if (!pickedUp) {
        setValidationError(`Add the pickup (P) for this rider before the dropoff (D).`);
        return;
      }
      // Prevent duplicate dropoff for this vehicle
      if (assignment.stops.some(s => s.riderId === riderId && s.type === 'dropoff')) {
        setValidationError(`Dropoff for this rider is already planned.`);
        return;
      }
      const newStops: Stop[] = [
        ...assignment.stops,
        { type: 'dropoff', riderId: rider.id, nodeId: rider.dropoffNodeId },
      ];
      updateAssignment(selectedVehicleId, newStops);
      setValidationError(null);
    }
  }

  function removeStop(vehicleId: string, index: number) {
    const assignment = getAssignment(vehicleId);
    const removedStop = assignment.stops[index];

    // If removing a pickup, also remove the corresponding dropoff
    const newStops = assignment.stops.filter((s, i) => {
      if (i === index) return false;
      if (removedStop.type === 'pickup' && s.riderId === removedStop.riderId && s.type === 'dropoff') return false;
      return true;
    });
    updateAssignment(vehicleId, newStops);
    setValidationError(null);
  }

  function resetPlan() {
    setAssignments([]);
    setSelectedVehicleId(null);
    setValidationError(null);
  }

  // Check all riders have both pickup and dropoff across all vehicles
  const riderCompletionStatus = level.riders.map(r => {
    let hasPickup  = false;
    let hasDropoff = false;
    for (const a of assignments) {
      if (a.stops.some(s => s.riderId === r.id && s.type === 'pickup'))  hasPickup = true;
      if (a.stops.some(s => s.riderId === r.id && s.type === 'dropoff')) hasDropoff = true;
    }
    return { rider: r, hasPickup, hasDropoff, complete: hasPickup && hasDropoff };
  });

  const allComplete = riderCompletionStatus.every(s => s.complete);
  const incompleteCount = riderCompletionStatus.filter(s => !s.complete).length;

  function handleStartShift() {
    if (!allComplete) {
      const missing = riderCompletionStatus
        .filter(s => !s.complete)
        .map(s => s.hasPickup ? `${s.rider.id}: missing dropoff` : `${s.rider.id}: missing pickup`)
        .join(', ');
      setValidationError(`Incomplete plan: ${missing}`);
      return;
    }

    const plan: PlayerPlan = { assignments };
    const result = validateAndSimulate(level, plan);

    if (!result.valid) {
      setValidationError(result.errorMessage ?? 'Invalid plan - check stop order');
      return;
    }

    navigation.navigate('LiveShift', { levelId, result });
  }

  const selectedVehicle = level.vehicles.find(v => v.id === selectedVehicleId);
  const selectedSpec    = selectedVehicle ? VEHICLE_SPECS[selectedVehicle.type] : null;

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safe} edges={['top']}>

          {/* Header */}
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
            <Text style={styles.headerTitle} numberOfLines={1}>
              Level {levelId}: {level.name}
            </Text>
            <TouchableOpacity onPress={resetPlan}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Error banner */}
          {validationError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          )}

          {/* Context hint */}
          <View style={styles.hintBar}>
            {selectedVehicle ? (
              <Text style={styles.hintText}>
                {selectedSpec?.label} selected  |  Tap P=pickup, D=dropoff, or another vehicle
              </Text>
            ) : (
              <Text style={styles.hintText}>
                Tap a vehicle to select it, then tap P (pickup) or D (dropoff) markers
              </Text>
            )}
          </View>

          {/* City map board */}
          <View style={styles.boardContainer}>
            <GameBoard
              cityMap={level.cityMap}
              vehicles={level.vehicles}
              riders={level.riders}
              assignments={assignments}
              selectedVehicleId={selectedVehicleId}
              onTap={handleBoardTap}
              boardWidth={boardWidth}
              boardHeight={boardHeight}
            />
          </View>

          {/* Map legend */}
          <View style={styles.legendRow}>
            <Text style={styles.legendItem}>Circle = Pickup (P/!/A/G)</Text>
            <Text style={styles.legendItem}>Square = Dropoff (D)</Text>
            {level.cityMap.edges.some(e => e.type === 'congested') && <Text style={styles.legendItem}>Red = congested</Text>}
            {level.cityMap.edges.some(e => e.type === 'rain_slow') && <Text style={styles.legendItem}>Blue = rain</Text>}
            {level.cityMap.edges.some(e => e.type === 'closed')    && <Text style={styles.legendItem}>Dashed = closed</Text>}
          </View>

          {/* Assignment panels */}
          <ScrollView style={styles.assignmentScroll} contentContainerStyle={{ padding: 10, gap: 8, paddingBottom: 4 }}>

            {/* Rider completion overview */}
            <View style={styles.riderOverview}>
              {riderCompletionStatus.map(({ rider, hasPickup, hasDropoff, complete }) => (
                <View key={rider.id} style={[styles.riderPill, complete && styles.riderPillDone]}>
                  <Text style={[styles.riderPillText, complete && styles.riderPillTextDone]}>
                    {RIDER_TYPE_LABELS[rider.type].slice(0, 3)}
                    {hasPickup ? ' P' : ' _'}
                    {hasDropoff ? ' D' : ' _'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Per-vehicle stop lists */}
            {level.vehicles.map(v => {
              const spec = VEHICLE_SPECS[v.type];
              const assignment = getAssignment(v.id);
              const isSelected = v.id === selectedVehicleId;
              const capUsed    = peakCapacity(assignment.stops);

              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vehicleCard, isSelected && styles.vehicleCardSelected]}
                  onPress={() => {
                    setSelectedVehicleId(prev => prev === v.id ? null : v.id);
                    setValidationError(null);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.vehicleCardHeader}>
                    <Text style={styles.vehicleCardName}>{spec.label}</Text>
                    <View style={styles.vehicleCardRight}>
                      {spec.accessible && <Text style={styles.accessibleBadge}>Accessible</Text>}
                      <Text style={styles.vehicleCapText}>Cap {capUsed}/{spec.capacity}</Text>
                    </View>
                  </View>

                  {assignment.stops.length === 0 ? (
                    <Text style={styles.emptyHint}>
                      {isSelected ? 'Now tap P (pickup) or D (dropoff) on the map' : 'Tap to select, then plan stops on the map'}
                    </Text>
                  ) : (
                    <View style={styles.stopList}>
                      {assignment.stops.map((stop, idx) => {
                        const rider = level.riders.find(r => r.id === stop.riderId);
                        return (
                          <View key={idx} style={[styles.stopRow, stop.type === 'dropoff' && styles.stopRowDropoff]}>
                            <Text style={styles.stopIndex}>{idx + 1}.</Text>
                            <View style={[styles.stopTypeBadge, stop.type === 'dropoff' && styles.stopTypeBadgeDropoff]}>
                              <Text style={styles.stopTypeBadgeText}>{stop.type === 'pickup' ? 'PICK' : 'DROP'}</Text>
                            </View>
                            <Text style={styles.stopRiderText} numberOfLines={1}>
                              {rider ? RIDER_TYPE_LABELS[rider.type] : stop.riderId}
                              {rider?.deadline ? ` (${rider.deadline}s)` : ''}
                            </Text>
                            <TouchableOpacity onPress={() => removeStop(v.id, idx)} style={styles.removeBtn}>
                              <Text style={styles.removeBtnText}>x</Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>

        {/* Footer */}
        <SafeAreaView edges={['bottom']}>
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.startBtn, !allComplete && styles.startBtnDisabled]}
              onPress={handleStartShift}
            >
              <Text style={styles.startBtnText}>
                {allComplete ? 'START SHIFT' : `${incompleteCount} rider${incompleteCount > 1 ? 's' : ''} not fully planned`}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:               { flex: 1 },
  container:          { flex: 1, backgroundColor: Colors.background },
  safe:               { flex: 1 },
  header:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backText:           { color: Colors.primary, fontSize: 14, minWidth: 48 },
  headerTitle:        { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1, textAlign: 'center', paddingHorizontal: 4 },
  resetText:          { color: Colors.warning, fontSize: 14, minWidth: 48, textAlign: 'right' },
  errorBanner:        { backgroundColor: Colors.danger + '28', paddingHorizontal: 14, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.danger + '44' },
  errorText:          { color: Colors.danger, fontSize: 12 },
  hintBar:            { backgroundColor: Colors.surfaceAlt, paddingHorizontal: 14, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  hintText:           { color: Colors.primaryLight, fontSize: 11 },
  boardContainer:     { alignItems: 'center', paddingHorizontal: 16, backgroundColor: Colors.mapBackground, paddingVertical: 6 },
  legendRow:          { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, paddingVertical: 4, gap: 6 },
  legendItem:         { fontSize: 10, color: Colors.textMuted },
  assignmentScroll:   { flex: 1 },
  riderOverview:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  riderPill:          { backgroundColor: Colors.surfaceAlt, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  riderPillDone:      { borderColor: Colors.success + '66', backgroundColor: Colors.success + '14' },
  riderPillText:      { fontSize: 10, color: Colors.textMuted, fontFamily: 'monospace' },
  riderPillTextDone:  { color: Colors.success },
  vehicleCard:        { backgroundColor: Colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border },
  vehicleCardSelected:{ borderColor: Colors.primary, backgroundColor: Colors.surfaceAlt },
  vehicleCardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  vehicleCardName:    { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  vehicleCardRight:   { flexDirection: 'row', gap: 6, alignItems: 'center' },
  accessibleBadge:    { fontSize: 10, color: Colors.vehicleAccess, backgroundColor: Colors.vehicleAccess + '22', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  vehicleCapText:     { fontSize: 11, color: Colors.textMuted },
  emptyHint:          { fontSize: 11, color: Colors.textMuted, fontStyle: 'italic' },
  stopList:           { gap: 4 },
  stopRow:            { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.mapBackground, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  stopRowDropoff:     { backgroundColor: Colors.background },
  stopIndex:          { fontSize: 11, color: Colors.textMuted, width: 16 },
  stopTypeBadge:      { backgroundColor: Colors.primary + '33', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  stopTypeBadgeDropoff: { backgroundColor: Colors.success + '28' },
  stopTypeBadgeText:  { fontSize: 10, fontWeight: '700', color: Colors.primaryLight },
  stopRiderText:      { flex: 1, fontSize: 12, color: Colors.textSecondary },
  removeBtn:          { paddingHorizontal: 6, paddingVertical: 2 },
  removeBtnText:      { color: Colors.danger, fontSize: 14, fontWeight: '700' },
  footer:             { paddingHorizontal: 14, paddingVertical: 10 },
  startBtn:           { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  startBtnDisabled:   { backgroundColor: Colors.surfaceAlt },
  startBtnText:       { color: '#fff', fontSize: 15, fontWeight: '700' },
});
