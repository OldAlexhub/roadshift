import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { GameStorage } from '../storage/gameStorage';
import { ACHIEVEMENTS } from '../data/achievements';
import StarDisplay from '../components/StarDisplay';
import BannerAdComponent from '../components/BannerAdComponent';
import { GameProgress } from '../types/game';
import { tryShowInterstitial } from '../ads/adManager';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export default function ResultsScreen({ navigation, route }: Props) {
  const { levelId, result, newAchievements } = route.params;
  const [prevBest, setPrevBest] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [progress, setProgress] = useState<GameProgress | null>(null);

  const starScale  = useRef(new Animated.Value(0)).current;
  const scoreAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    GameStorage.loadProgress().then(p => {
      const prev = p.levels[levelId];
      const prevScore = prev ? prev.bestScore : 0;
      setIsNewBest(result.score > prevScore);
      setPrevBest(prevScore);
      setProgress(p);
    });

    Animated.sequence([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(starScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(scoreAnim, { toValue: result.score, duration: 1000, useNativeDriver: false }),
    ]).start();
  }, []);

  async function handleNext(dest: 'next' | 'map') {
    const adState = await GameStorage.loadAdState();
    const updatedState = { ...adState, successfulCompletions: adState.successfulCompletions + 1 };
    await GameStorage.saveAdState(updatedState);
    await tryShowInterstitial(updatedState);

    if (dest === 'next') {
      const nextId = levelId + 1;
      if (nextId <= 60) {
        navigation.navigate('LevelBriefing', { levelId: nextId });
      } else {
        navigation.navigate('Home');
      }
    } else {
      navigation.navigate('DistrictMap', {});
    }
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
          <Text style={styles.levelLabel}>Level {levelId} Complete</Text>

          <Animated.View style={{ transform: [{ scale: starScale }] }}>
            <StarDisplay stars={result.stars} size={44} />
          </Animated.View>

          <Animated.Text style={styles.score}>
            {scoreAnim.interpolate({ inputRange: [0, 1000], outputRange: ['0', '1000'] }).valueOf().toString().includes('.')
              ? result.score
              : result.score
            }
          </Animated.Text>
          <Text style={styles.scoreLabel}>points</Text>

          {isNewBest && (
            <View style={styles.newBestBadge}>
              <Text style={styles.newBestText}>New Best!</Text>
            </View>
          )}

          <ScrollView contentContainerStyle={styles.statsScroll}>
            <StatRow label="Riders Served" value={`${result.ridersServed} / ${result.riderResults.length}`} />
            <StatRow label="On Time"       value={`${result.ridersOnTime} / ${result.ridersServed}`} color={result.ridersOnTime === result.ridersServed ? Colors.success : Colors.warning} />
            <StatRow label="Route Cost"    value={result.totalCost.toFixed(1)} />
            <StatRow label="Total Time"    value={`${result.totalTime.toFixed(0)}s`} />
            {result.specialObjectiveMet && <StatRow label="Special Goal" value="Achieved!" color={Colors.accent} />}
            <StatRow label="Previous Best" value={`${prevBest} pts`} />

            {newAchievements.length > 0 && (
              <View style={styles.achieveSection}>
                <Text style={styles.achieveTitle}>Achievements Unlocked</Text>
                {newAchievements.map(id => {
                  const def = ACHIEVEMENTS.find(a => a.id === id);
                  return def ? (
                    <View key={id} style={styles.achieveRow}>
                      <Text style={styles.achieveName}>{def.name}</Text>
                      <Text style={styles.achieveDesc}>{def.description}</Text>
                    </View>
                  ) : null;
                })}
              </View>
            )}
          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.replace('DispatchBoard', { levelId })}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
            {levelId < 60 && (
              <TouchableOpacity style={styles.nextBtn} onPress={() => handleNext('next')}>
                <Text style={styles.nextBtnText}>Next Level</Text>
              </TouchableOpacity>
            )}
            <View style={styles.bottomRow}>
              <TouchableOpacity style={styles.mapBtn} onPress={() => handleNext('map')}>
                <Text style={styles.mapBtnText}>District Map</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.mapBtnText}>Home</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.adFooter}>
            <BannerAdComponent />
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.background },
  safe:          { flex: 1 },
  inner:         { flex: 1, alignItems: 'center', padding: 24, gap: 12 },
  levelLabel:    { fontSize: 14, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 2 },
  score:         { fontSize: 64, fontWeight: '900', color: Colors.textPrimary },
  scoreLabel:    { fontSize: 14, color: Colors.textMuted, marginTop: -12 },
  newBestBadge:  { backgroundColor: Colors.accent, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 5 },
  newBestText:   { color: Colors.background, fontWeight: '800', fontSize: 13 },
  statsScroll:   { width: '100%', gap: 8 },
  statRow:       { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.surface, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: Colors.border },
  statLabel:     { color: Colors.textSecondary, fontSize: 14 },
  statValue:     { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  achieveSection: { gap: 8, marginTop: 8 },
  achieveTitle:  { fontSize: 13, color: Colors.accent, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
  achieveRow:    { backgroundColor: Colors.surfaceAlt, borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: Colors.accent },
  achieveName:   { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  achieveDesc:   { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  buttons:       { width: '100%', gap: 8 },
  retryBtn:      { paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceAlt },
  retryBtnText:  { color: Colors.textSecondary, fontSize: 15 },
  nextBtn:       { paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: Colors.primary },
  nextBtnText:   { color: '#fff', fontSize: 16, fontWeight: '700' },
  bottomRow:     { flexDirection: 'row', gap: 8 },
  mapBtn:        { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  homeBtn:       { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: Colors.surfaceAlt },
  mapBtnText:    { color: Colors.textSecondary, fontSize: 15 },
  adFooter:      { marginTop: 8, alignItems: 'center' },
});
