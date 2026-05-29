import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Circle, G } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { getLevel } from '../data/levels';
import { VEHICLE_SPECS } from '../types/game';
import { getNodePosition } from '../engine/routeEngine';
import { GameStorage, checkAchievements } from '../storage/gameStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'LiveShift'>;

const ROAD_COLORS: Record<string, string> = {
  normal:    '#1e2d45', fast:      '#1e3a5f', congested: '#7f2020',
  rain_slow: '#1a2a5f', closed:    '#3a0808', one_way:   '#1e2d45',
};

const VEHICLE_COLORS: Record<string, string> = {
  compact_cab: Colors.vehicleCompact, city_van: Colors.vehicleVan,
  access_van:  Colors.vehicleAccess,  shuttle:  Colors.vehicleShuttle,
};

const RIDER_COLORS: Record<string, string> = {
  standard:   Colors.riderStandard, priority:   Colors.riderPriority,
  accessible: Colors.riderAccessible, group:    Colors.riderGroup,
};

export default function LiveShiftScreen({ navigation, route }: Props) {
  const { levelId, result } = route.params;
  const level = getLevel(levelId);
  const { width, height } = useWindowDimensions();
  const boardWidth  = width - 32;
  const boardHeight = Math.min(height * 0.45, 320);

  const [phase, setPhase] = useState<'running' | 'done'>('running');
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [vehiclePositions, setVehiclePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [riderStatuses, setRiderStatuses] = useState<Record<string, 'waiting' | 'aboard' | 'delivered'>>({});
  const frameRef = useRef<any>(null);
  const startTimeRef = useRef(Date.now());
  const speedRef = useRef(speedMultiplier);
  const phaseRef = useRef('running');
  const savedRef = useRef(false);

  const rows = level?.cityMap.rows ?? 1;
  const cols = level?.cityMap.cols ?? 1;

  const nodePos = useCallback((nodeId: string) => {
    const node = level?.cityMap.nodes.find(n => n.id === nodeId);
    if (!node) return { x: boardWidth / 2, y: boardHeight / 2 };
    return getNodePosition(node, boardWidth, boardHeight, rows, cols);
  }, [level, boardWidth, boardHeight, rows, cols]);

  useEffect(() => { speedRef.current = speedMultiplier; }, [speedMultiplier]);

  useEffect(() => {
    if (!level) return;

    const initialRiderStatuses: Record<string, 'waiting' | 'aboard' | 'delivered'> = {};
    level.riders.forEach(r => { initialRiderStatuses[r.id] = 'waiting'; });
    setRiderStatuses(initialRiderStatuses);

    const initialPositions: Record<string, { x: number; y: number }> = {};
    level.vehicles.forEach(v => { initialPositions[v.id] = nodePos(v.startNodeId); });
    setVehiclePositions(initialPositions);
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) * speedRef.current;
      const simTime = elapsed / 60;

      const newRiderStatuses: Record<string, 'waiting' | 'aboard' | 'delivered'> = {};
      level.riders.forEach(r => {
        const rr = result.riderResults.find(x => x.riderId === r.id);
        if (!rr) { newRiderStatuses[r.id] = 'waiting'; return; }
        if (simTime >= rr.actualDropoffTime) newRiderStatuses[r.id] = 'delivered';
        else if (simTime >= rr.actualPickupTime) newRiderStatuses[r.id] = 'aboard';
        else newRiderStatuses[r.id] = 'waiting';
      });
      setRiderStatuses({ ...newRiderStatuses });

      const newPositions: Record<string, { x: number; y: number }> = {};
      for (const vr of result.vehicleRoutes) {
        let cumTime = 0;
        let placed = false;
        for (const seg of vr.segments) {
          if (simTime <= cumTime + seg.travelTime && seg.travelTime > 0) {
            const t  = (simTime - cumTime) / seg.travelTime;
            const pi = Math.min(Math.floor(t * (seg.path.length - 1)), seg.path.length - 2);
            const pt = Math.max(0, t * (seg.path.length - 1) - pi);
            const fromPos = nodePos(seg.path[pi]);
            const toPos   = nodePos(seg.path[Math.min(pi + 1, seg.path.length - 1)]);
            newPositions[vr.vehicleId] = {
              x: fromPos.x + (toPos.x - fromPos.x) * pt,
              y: fromPos.y + (toPos.y - fromPos.y) * pt,
            };
            placed = true;
            break;
          }
          cumTime += seg.travelTime;
        }
        if (!placed && vr.segments.length > 0) {
          const lastSeg = vr.segments[vr.segments.length - 1];
          newPositions[vr.vehicleId] = nodePos(lastSeg.toNodeId);
        }
      }
      setVehiclePositions({ ...newPositions });

      const totalSimTime = result.totalTime;
      if (simTime >= totalSimTime && phaseRef.current === 'running') {
        phaseRef.current = 'done';
        setPhase('done');
        doSave();
        return;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [level]);

  async function doSave() {
    if (savedRef.current || !level) return;
    savedRef.current = true;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const progress = await GameStorage.loadProgress();
    const newProgress = await GameStorage.saveLevelResult(progress, levelId, result.score, result.stars, level.districtId);
    const achievements = await GameStorage.loadAchievements();
    const newlyUnlocked = checkAchievements(newProgress, achievements, levelId, result.stars, {
      ridersOnTime: result.ridersOnTime,
      totalRiders:  result.riderResults.length,
      vehicleCount: level.vehicles.length,
    });
    for (const id of newlyUnlocked) {
      await GameStorage.unlockAchievement(id);
    }
    navigation.replace('Results', { levelId, result, newAchievements: newlyUnlocked });
  }

  if (!level) return null;

  const simTime = (Date.now() - startTimeRef.current) * speedRef.current / 60;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shift in Progress</Text>
          <View style={styles.speedRow}>
            {[1, 3].map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.speedBtn, speedMultiplier === s && styles.speedActive]}
                onPress={() => setSpeedMultiplier(s)}
              >
                <Text style={styles.speedBtnText}>{s}x</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.boardContainer}>
          <Svg width={boardWidth} height={boardHeight}>
            {level.cityMap.edges.map(edge => {
              const from = nodePos(edge.from);
              const to   = nodePos(edge.to);
              return (
                <Line key={edge.id}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={ROAD_COLORS[edge.type] ?? ROAD_COLORS.normal}
                  strokeWidth={3}
                />
              );
            })}

            {result.vehicleRoutes.flatMap(vr =>
              vr.segments.flatMap((seg, si) =>
                seg.path.slice(0, -1).map((nodeId, i) => {
                  const vehicle = level.vehicles.find(v => v.id === vr.vehicleId);
                  const color   = vehicle ? (VEHICLE_COLORS[vehicle.type] ?? Colors.routeGlow) : Colors.routeGlow;
                  const from = nodePos(nodeId);
                  const to   = nodePos(seg.path[i + 1]);
                  return <Line key={`${vr.vehicleId}_${si}_${i}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={4} opacity={0.5} />;
                }),
              ),
            )}

            {level.riders.map(r => {
              const status = riderStatuses[r.id] ?? 'waiting';
              if (status === 'delivered') return null;
              const nodeId = status === 'waiting' ? r.pickupNodeId : r.dropoffNodeId;
              const pos    = nodePos(nodeId);
              const color  = RIDER_COLORS[r.type] ?? Colors.riderStandard;
              return (
                <G key={r.id}>
                  <Circle cx={pos.x} cy={pos.y} r={status === 'waiting' ? 8 : 5} fill={color} opacity={0.7} />
                </G>
              );
            })}

            {level.vehicles.map(v => {
              const pos   = vehiclePositions[v.id] ?? nodePos(v.startNodeId);
              const color = VEHICLE_COLORS[v.type] ?? Colors.vehicleCompact;
              return (
                <G key={v.id}>
                  <Circle cx={pos.x} cy={pos.y} r={12} fill={color} />
                </G>
              );
            })}
          </Svg>
        </View>

        <ScrollView contentContainerStyle={styles.statusPanel}>
          {result.riderResults.map(rr => {
            const rider  = level.riders.find(r => r.id === rr.riderId);
            const status = riderStatuses[rr.riderId] ?? 'waiting';
            return (
              <View key={rr.riderId} style={styles.riderStatus}>
                <Text style={styles.riderStatusName}>{rider?.type ?? rr.riderId}</Text>
                <Text style={[styles.riderStatusState,
                  status === 'delivered' ? styles.statusDone : status === 'aboard' ? styles.statusAboard : styles.statusWaiting,
                ]}>
                  {status === 'waiting' ? 'Waiting' : status === 'aboard' ? 'En Route' : 'Delivered'}
                </Text>
                {rider?.deadline && (
                  <Text style={[styles.deadline, rr.onTime ? styles.onTime : styles.late]}>
                    {rr.onTime ? 'On Time' : 'Late'}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.skipBtn} onPress={() => {
              phaseRef.current = 'done';
              setPhase('done');
              doSave();
            }}>
              <Text style={styles.skipBtnText}>
                {phase === 'done' ? 'View Results' : 'Skip to Results'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => {
                if (frameRef.current) cancelAnimationFrame(frameRef.current);
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.homeBtnText}>Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  safe:           { flex: 1 },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle:    { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  speedRow:       { flexDirection: 'row', gap: 8 },
  speedBtn:       { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border },
  speedActive:    { borderColor: Colors.primary, backgroundColor: Colors.primary + '33' },
  speedBtnText:   { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  boardContainer: { alignItems: 'center', backgroundColor: Colors.mapBackground, paddingVertical: 8 },
  statusPanel:    { padding: 16, gap: 8 },
  riderStatus:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.border },
  riderStatusName: { flex: 1, color: Colors.textPrimary, fontSize: 13, textTransform: 'capitalize' },
  riderStatusState: { fontSize: 12, fontWeight: '600' },
  statusDone:     { color: Colors.success },
  statusAboard:   { color: Colors.primary },
  statusWaiting:  { color: Colors.textMuted },
  deadline:       { fontSize: 12, marginLeft: 8 },
  onTime:         { color: Colors.success },
  late:           { color: Colors.danger },
  footer:         { padding: 12 },
  footerRow:      { flexDirection: 'row', gap: 8 },
  skipBtn:        { flex: 1, backgroundColor: Colors.surfaceAlt, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary },
  skipBtnText:    { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  homeBtn:        { backgroundColor: Colors.surfaceAlt, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  homeBtnText:    { color: Colors.textMuted, fontSize: 14 },
});
