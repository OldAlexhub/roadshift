import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { GameStorage } from '../storage/gameStorage';
import { GameProgress } from '../types/game';
import BannerAdComponent from '../components/BannerAdComponent';
import { tryShowAppOpen } from '../ads/adManager';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
      ]),
    ).start();

    GameStorage.loadProgress().then(p => {
      setProgress(p);
      GameStorage.loadAdState().then(ad => tryShowAppOpen(ad, 'Home'));
    });
  }, []);

  const hasProgress = progress && Object.keys(progress.levels).length > 0;
  const totalStars  = progress?.totalStars ?? 0;
  const nextLevel   = progress
    ? (Object.keys(progress.levels).length > 0
        ? Math.min(60, Math.max(...Object.keys(progress.levels).map(Number)) + 1)
        : 1)
    : 1;

  return (
    <View style={styles.container}>
      <GridLines glow={glowAnim} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
          <View style={styles.logoRow}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.title}>RoadShift</Text>
          <Text style={styles.subtitle}>Traffic Puzzle</Text>
          <Text style={styles.tagline}>Plan routes. Move riders. Beat the grid.</Text>

          {totalStars > 0 && (
            <View style={styles.statsRow}>
              <Text style={styles.statStar}>★ {totalStars} / 180</Text>
            </View>
          )}

          <View style={styles.buttons}>
            {hasProgress && (
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={() => navigation.navigate('LevelBriefing', { levelId: nextLevel })}
              >
                <Text style={styles.btnText}>Continue  Level {nextLevel}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.btn, hasProgress ? styles.btnSecondary : styles.btnPrimary]}
              onPress={() => navigation.navigate('DistrictMap', {})}
            >
              <Text style={styles.btnText}>District Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={() => navigation.navigate('Achievements')}
            >
              <Text style={styles.btnText}>Achievements</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.btnText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
      <SafeAreaView edges={['bottom']} style={styles.bannerSlot}>
        <BannerAdComponent />
      </SafeAreaView>
    </View>
  );
}

function GridLines({ glow }: { glow: Animated.Value }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 10 }).map((_, i) => (
        <Animated.View
          key={`h${i}`}
          style={[styles.gridLine, styles.hLine, { top: `${(i + 1) * 9}%`, opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.03, 0.07] }) }]}
        />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <Animated.View
          key={`v${i}`}
          style={[styles.gridLine, styles.vLine, { left: `${(i + 1) * 15}%`, opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.03, 0.07] }) }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background },
  safe:       { flex: 1 },
  inner:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  logoRow:    { marginBottom: 8 },
  logo:       { width: 80, height: 80 },
  title:      { fontSize: 42, fontWeight: '800', color: Colors.primaryLight, letterSpacing: 2 },
  subtitle:   { fontSize: 14, color: Colors.textMuted, letterSpacing: 4, textTransform: 'uppercase', marginTop: -8 },
  tagline:    { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: 8 },
  statsRow:   { backgroundColor: Colors.surfaceAlt, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8 },
  statStar:   { fontSize: 16, color: Colors.starGold, fontWeight: '700' },
  buttons:    { width: '100%', gap: 10, marginTop: 12 },
  btn:        { paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  btnPrimary: { backgroundColor: Colors.primary },
  btnSecondary: { backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border },
  btnText:    { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  bannerSlot: { alignItems: 'center', paddingBottom: 8 },
  gridLine:   { position: 'absolute', backgroundColor: Colors.primaryLight },
  hLine:      { left: 0, right: 0, height: 1 },
  vLine:      { top: 0, bottom: 0, width: 1 },
});
