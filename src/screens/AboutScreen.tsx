import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

export default function AboutScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About</Text>
          <View style={{ width: 50 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>RoadShift: Traffic Puzzle</Text>
          <Text style={styles.tagline}>Plan routes. Move riders. Beat the grid.</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.developer}>Developed by Old Alex Hub</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the Game</Text>
            <Text style={styles.body}>
              RoadShift is a city traffic puzzle game where you manage a fleet of vehicles across a nighttime city grid. Plan pickups and dropoffs, navigate road conditions, and earn stars for efficient service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Six Districts, 60 Levels</Text>
            <Text style={styles.body}>
              Each district introduces new mechanics including capacity management, accessibility requirements, rain delays, road closures, and event surges. The Midnight Grid district combines everything for the ultimate challenge.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Free to Play</Text>
            <Text style={styles.body}>
              RoadShift is completely free to play. Ads are shown to support development. All game content is available without any purchases.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Offline Play</Text>
            <Text style={styles.body}>
              All 60 levels work fully offline. Internet is only used for ads.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Privacy</Text>
            <Text style={styles.body}>
              No account or personal information required. Progress is saved locally on your device only. See the Privacy Policy for full details.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background },
  safe:         { flex: 1 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backText:     { color: Colors.primary, fontSize: 15 },
  headerTitle:  { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  scroll:       { padding: 20, gap: 16, alignItems: 'center', paddingBottom: 40 },
  logo:         { width: 80, height: 80, marginBottom: 8 },
  appName:      { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  tagline:      { fontSize: 13, color: Colors.textSecondary },
  version:      { fontSize: 12, color: Colors.textMuted },
  developer:    { fontSize: 13, color: Colors.textMuted },
  section:      { width: '100%', gap: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  body:         { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
});
