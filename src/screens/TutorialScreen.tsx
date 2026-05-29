import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { GameStorage } from '../storage/gameStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Tutorial'>;

const STEPS = [
  {
    title: 'Welcome to RoadShift',
    icon: '🌃',
    body: [
      'You manage a fleet of vehicles across a city at night.',
      'Riders are waiting at marked pickup points.',
      'Your job: assign vehicles, plan routes, and launch the shift.',
    ],
  },
  {
    title: 'Select a Vehicle',
    icon: '🚕',
    body: [
      'Tap any vehicle on the dispatch board to select it.',
      'Selected vehicles glow and are ready for assignments.',
      'Each vehicle type has different speed and capacity.',
    ],
  },
  {
    title: 'Assign Riders',
    icon: '👤',
    body: [
      'With a vehicle selected, tap a waiting rider to assign them.',
      'Riders show their pickup and dropoff locations.',
      'Priority riders have tighter deadlines. Accessible riders need Access Vans.',
    ],
  },
  {
    title: 'Plan the Route',
    icon: '🗺️',
    body: [
      'Once assigned, a glowing route shows the planned path.',
      'You can reorder stops using the stop list below each vehicle.',
      'Watch for congested, rain-slowed, or closed roads.',
    ],
  },
  {
    title: 'Start the Shift',
    icon: '▶️',
    body: [
      'When all riders are assigned, the Start Shift button activates.',
      'Watch vehicles move along the planned routes.',
      'Riders board and alight. Timers show on-time status.',
    ],
  },
  {
    title: 'Earn Stars',
    icon: '⭐',
    body: [
      'One star: all riders served.',
      'Two stars: efficient routes, no major delays.',
      'Three stars: all on time, optimal routing, and the level objective complete.',
    ],
  },
];

export default function TutorialScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function animate(callback: () => void) {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    callback();
  }

  function next() {
    if (step < STEPS.length - 1) {
      animate(() => setStep(s => s + 1));
    } else {
      finish();
    }
  }

  function prev() {
    if (step > 0) animate(() => setStep(s => s - 1));
  }

  async function finish() {
    const progress = await GameStorage.loadProgress();
    await GameStorage.saveProgress({ ...progress, tutorialComplete: true });
    navigation.replace('Home');
  }

  const current = STEPS[step];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.stepText}>{step + 1} / {STEPS.length}</Text>
          <TouchableOpacity onPress={finish}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressRow}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.pip, i <= step && styles.pipActive]} />
          ))}
        </View>

        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.icon}>{current.icon}</Text>
          <Text style={styles.cardTitle}>{current.title}</Text>
          {current.body.map((line, i) => (
            <Text key={i} style={styles.bodyText}>{line}</Text>
          ))}
        </Animated.View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, step === 0 && styles.navBtnDisabled]}
            onPress={prev}
            disabled={step === 0}
          >
            <Text style={styles.navBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary]} onPress={next}>
            <Text style={[styles.navBtnText, styles.navBtnPrimaryText]}>
              {step === STEPS.length - 1 ? 'Play Now' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.background },
  safe:            { flex: 1, padding: 20 },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  stepText:        { color: Colors.textMuted, fontSize: 14 },
  skipText:        { color: Colors.textSecondary, fontSize: 14 },
  progressRow:     { flexDirection: 'row', gap: 6, marginBottom: 32 },
  pip:             { flex: 1, height: 3, borderRadius: 2, backgroundColor: Colors.border },
  pipActive:       { backgroundColor: Colors.primary },
  card:            { flex: 1, backgroundColor: Colors.surface, borderRadius: 16, padding: 28, alignItems: 'center', justifyContent: 'center', gap: 16, borderWidth: 1, borderColor: Colors.border },
  icon:            { fontSize: 56 },
  cardTitle:       { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  bodyText:        { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  navRow:          { flexDirection: 'row', gap: 12, marginTop: 24 },
  navBtn:          { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border },
  navBtnDisabled:  { opacity: 0.3 },
  navBtnPrimary:   { backgroundColor: Colors.primary, borderColor: Colors.primary },
  navBtnText:      { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  navBtnPrimaryText: { color: '#fff' },
});
