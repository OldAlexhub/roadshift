import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { DISTRICTS } from '../data/districts';
import { ALL_LEVELS } from '../data/levels';
import { GameProgress } from '../types/game';
import { GameStorage } from '../storage/gameStorage';
import StarDisplay from '../components/StarDisplay';
import BannerAdComponent from '../components/BannerAdComponent';

type Props = NativeStackScreenProps<RootStackParamList, 'DistrictMap'>;

export default function DistrictMapScreen({ navigation, route }: Props) {
  const [progress, setProgress] = useState<GameProgress | null>(null);

  useEffect(() => {
    GameStorage.loadProgress().then(setProgress);
  }, []);

  const unlocked = progress?.unlockedDistricts ?? [1];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>District Map</Text>
          {progress && <Text style={styles.totalStars}>★ {progress.totalStars}</Text>}
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {DISTRICTS.map(district => {
            const isUnlocked = unlocked.includes(district.id);
            const levels     = ALL_LEVELS.filter(l => l.districtId === district.id);
            const distStars  = levels.reduce((s, l) => s + (progress?.levels[l.id]?.stars ?? 0), 0);
            const completed  = levels.filter(l => progress?.levels[l.id]?.completed).length;
            const color      = Colors.districtColors[district.id - 1];

            return (
              <View key={district.id} style={[styles.districtCard, !isUnlocked && styles.locked]}>
                <View style={[styles.districtHeader, { borderLeftColor: color }]}>
                  <View>
                    <Text style={styles.districtName}>{district.name}</Text>
                    <Text style={styles.districtMood}>{district.mood}</Text>
                  </View>
                  {isUnlocked
                    ? <Text style={[styles.districtStars, { color }]}>★ {distStars} / {levels.length * 3}</Text>
                    : <Text style={styles.lockText}>Locked</Text>
                  }
                </View>

                {isUnlocked && (
                  <>
                    <View style={styles.levelGrid}>
                      {levels.map(level => {
                        const lp    = progress?.levels[level.id];
                        const done  = lp?.completed ?? false;
                        const stars = lp?.stars ?? 0;
                        return (
                          <TouchableOpacity
                            key={level.id}
                            style={[styles.levelNode, done && styles.levelDone, { borderColor: done ? color : Colors.border }]}
                            onPress={() => navigation.navigate('LevelBriefing', { levelId: level.id })}
                          >
                            <Text style={[styles.levelNum, done && { color }]}>{level.id}</Text>
                            {done && <StarDisplay stars={stars as 0|1|2|3} size={8} />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <Text style={styles.progress}>{completed} / {levels.length} levels complete</Text>
                  </>
                )}

                {!isUnlocked && (
                  <Text style={styles.unlockHint}>
                    Earn {district.unlockRequirement} stars to unlock
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
      <SafeAreaView edges={['bottom']} style={styles.bannerSlot}>
        <BannerAdComponent />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  safe:           { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn:        {},
  backText:       { color: Colors.primary, fontSize: 15 },
  headerTitle:    { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  totalStars:     { color: Colors.starGold, fontWeight: '700' },
  scroll:         { padding: 16, gap: 16, paddingBottom: 32 },
  districtCard:   { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border },
  locked:         { opacity: 0.5 },
  districtHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderLeftWidth: 4, paddingLeft: 10, marginBottom: 12 },
  districtName:   { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  districtMood:   { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  districtStars:  { fontWeight: '700', fontSize: 14 },
  lockText:       { color: Colors.textMuted, fontSize: 13 },
  levelGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelNode:      { width: 44, height: 44, borderRadius: 8, backgroundColor: Colors.surfaceAlt, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  levelDone:      { backgroundColor: Colors.mapGrid },
  levelNum:       { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  progress:       { fontSize: 12, color: Colors.textMuted, marginTop: 10 },
  unlockHint:     { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  bannerSlot:     { alignItems: 'center', paddingBottom: 8 },
});
