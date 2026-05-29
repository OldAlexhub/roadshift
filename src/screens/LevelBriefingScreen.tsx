import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { getLevel } from '../data/levels';
import { DISTRICTS } from '../data/districts';
import { GameStorage } from '../storage/gameStorage';
import { VEHICLE_SPECS } from '../types/game';
import StarDisplay from '../components/StarDisplay';
import BannerAdComponent from '../components/BannerAdComponent';

type Props = NativeStackScreenProps<RootStackParamList, 'LevelBriefing'>;

const RIDER_ICONS: Record<string, string> = {
  standard:   '🧍',
  priority:   '⚡',
  accessible: '♿',
  group:      '👥',
};

const VEHICLE_ICONS: Record<string, string> = {
  compact_cab: '🚕',
  city_van:    '🚐',
  access_van:  '♿🚐',
  shuttle:     '🚌',
};

export default function LevelBriefingScreen({ navigation, route }: Props) {
  const { levelId } = route.params;
  const level    = getLevel(levelId);
  const district = level ? DISTRICTS.find(d => d.id === level.districtId) : null;
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    GameStorage.loadProgress().then(setProgress);
  }, []);

  if (!level) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <Text style={{ color: Colors.danger }}>Level not found</Text>
        </SafeAreaView>
      </View>
    );
  }

  const prevResult = progress?.levels[levelId];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.districtLabel}>{district?.name ?? ''}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.levelNum}>Level {levelId}</Text>
          <Text style={styles.levelName}>{level.name}</Text>
          <Text style={styles.description}>{level.description}</Text>

          <View style={styles.objectiveCard}>
            <Text style={styles.objectiveLabel}>Objective</Text>
            <Text style={styles.objectiveText}>{level.objective}</Text>
            {level.specialRule && <Text style={styles.specialRule}>{level.specialRule}</Text>}
          </View>

          {prevResult && (
            <View style={styles.prevCard}>
              <Text style={styles.prevLabel}>Previous Best</Text>
              <View style={styles.prevRow}>
                <StarDisplay stars={prevResult.stars} size={20} />
                <Text style={styles.prevScore}>{prevResult.bestScore} pts</Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Vehicles</Text>
            {level.vehicles.map(v => {
              const spec = VEHICLE_SPECS[v.type];
              return (
                <View key={v.id} style={styles.listRow}>
                  <Text style={styles.icon}>{VEHICLE_ICONS[v.type]}</Text>
                  <View>
                    <Text style={styles.listName}>{spec.label}</Text>
                    <Text style={styles.listSub}>
                      Cap: {spec.capacity} | {spec.accessible ? 'Accessible' : 'Standard'} | Speed: {spec.speed.toFixed(1)}x
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Riders ({level.riders.length})</Text>
            {level.riders.map(r => (
              <View key={r.id} style={styles.listRow}>
                <Text style={styles.icon}>{RIDER_ICONS[r.type]}</Text>
                <View>
                  <Text style={styles.listName}>{r.type.charAt(0).toUpperCase() + r.type.slice(1)} Rider</Text>
                  <Text style={styles.listSub}>
                    {r.deadline ? `Deadline: ${r.deadline}s | ` : ''}
                    Capacity slots: {r.capacityUsed}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.starCard}>
            <Text style={styles.sectionTitle}>Star Goals</Text>
            {(['one','two','three'] as const).map((s, i) => (
              <View key={s} style={styles.starRow}>
                <StarDisplay stars={(i + 1) as 0|1|2|3} size={16} />
                <Text style={styles.starDesc}>
                  {s === 'one'   ? 'Serve all riders'
                   : s === 'two' ? `Efficient routes (cost ≤ ${level.twoStarCostCeiling})`
                   : `Near-perfect (cost ≤ ${level.threeStarCostCeiling}, all on time${level.specialObjectiveDescription ? ', ' + level.specialObjectiveDescription : ''})`}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <BannerAdComponent />
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => navigation.navigate('DispatchBoard', { levelId })}
          >
            <Text style={styles.startBtnText}>Start Planning</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.background },
  safe:          { flex: 1 },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backText:      { color: Colors.primary, fontSize: 15 },
  districtLabel: { color: Colors.textMuted, fontSize: 13 },
  scroll:        { padding: 20, gap: 16, paddingBottom: 32 },
  levelNum:      { fontSize: 13, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 2 },
  levelName:     { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  description:   { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  objectiveCard: { backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 16, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  objectiveLabel: { fontSize: 11, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  objectiveText: { fontSize: 15, color: Colors.textPrimary, lineHeight: 22 },
  specialRule:   { fontSize: 13, color: Colors.accent, marginTop: 8 },
  prevCard:      { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  prevLabel:     { fontSize: 12, color: Colors.textMuted, marginBottom: 8 },
  prevRow:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prevScore:     { color: Colors.textPrimary, fontWeight: '700' },
  section:       { gap: 10 },
  sectionTitle:  { fontSize: 14, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
  listRow:       { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.border },
  icon:          { fontSize: 24 },
  listName:      { fontSize: 15, color: Colors.textPrimary, fontWeight: '600' },
  listSub:       { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  starCard:      { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: Colors.border },
  starRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  starDesc:      { flex: 1, fontSize: 13, color: Colors.textSecondary },
  footer:        { padding: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  startBtn:      { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  startBtnText:  { color: '#fff', fontSize: 17, fontWeight: '700' },
});
