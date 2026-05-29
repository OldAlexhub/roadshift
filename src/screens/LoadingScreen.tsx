import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { GameStorage } from '../storage/gameStorage';
import { initializeAds, markFirstLaunchDone } from '../ads/adManager';

type Props = NativeStackScreenProps<RootStackParamList, 'Loading'>;

export default function LoadingScreen({ navigation }: Props) {
  const pulseAnim  = useRef(new Animated.Value(0.7)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();

    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    let done = false;
    async function init() {
      const [progress] = await Promise.all<any>([
        GameStorage.loadProgress(),
        initializeAds(),
      ]);

      markFirstLaunchDone();

      await new Promise<void>(r => setTimeout(() => r(), 1800));
      if (done) return;
      done = true;

      if (!progress.tutorialComplete) {
        navigation.replace('Tutorial');
      } else {
        navigation.replace('Home');
      }
    }

    init();
    return () => { done = true; };
  }, []);

  return (
    <View style={styles.container}>
      <GridBackground />
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </Animated.View>
          <Text style={styles.title}>RoadShift</Text>
          <Text style={styles.tagline}>Plan routes. Move riders. Beat the grid.</Text>
          <View style={styles.loadingRow}>
            <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function GridBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 14 }).map((_, i) => (
        <View key={`h${i}`} style={[styles.gridLine, styles.hLine, { top: `${(i + 1) * 7}%` }]} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={`v${i}`} style={[styles.gridLine, styles.vLine, { left: `${(i + 1) * 12}%` }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background },
  safe:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content:    { alignItems: 'center', gap: 16 },
  logo:       { width: 120, height: 120 },
  title:      { fontSize: 38, fontWeight: '800', color: Colors.primaryLight, letterSpacing: 2 },
  tagline:    { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', letterSpacing: 0.5 },
  loadingRow: { flexDirection: 'row', gap: 8, marginTop: 24 },
  dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  gridLine:   { position: 'absolute', backgroundColor: Colors.mapGrid },
  hLine:      { left: 0, right: 0, height: 1 },
  vLine:      { top: 0, bottom: 0, width: 1 },
});
