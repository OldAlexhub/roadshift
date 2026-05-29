import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { GameStorage } from '../storage/gameStorage';
import { GameSettings } from '../types/game';
import { showPrivacyOptions } from '../ads/adManager';
import BannerAdComponent from '../components/BannerAdComponent';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const APP_VERSION = '1.0.0';

export default function SettingsScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<GameSettings>({ soundEnabled: true, hapticEnabled: true });

  useEffect(() => {
    GameStorage.loadSettings().then(setSettings);
  }, []);

  async function toggle(key: keyof GameSettings) {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    await GameStorage.saveSettings(next);
  }

  function confirmReset() {
    Alert.alert(
      'Reset All Progress',
      'This will erase all level progress, stars, achievements, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await GameStorage.resetAll();
            Alert.alert('Progress Reset', 'All data has been cleared.', [
              { text: 'OK', onPress: () => navigation.replace('Loading') },
            ]);
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>Sound Effects</Text>
              <Text style={styles.rowSub}>Enable in-game sounds</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={() => toggle('soundEnabled')}
              trackColor={{ true: Colors.primary }}
            />
          </View>

          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>Haptic Feedback</Text>
              <Text style={styles.rowSub}>Vibration on interactions</Text>
            </View>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={() => toggle('hapticEnabled')}
              trackColor={{ true: Colors.primary }}
            />
          </View>

          <Text style={styles.sectionTitle}>Help</Text>

          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Tutorial')}>
            <Text style={styles.rowLabel}>Replay Tutorial</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Privacy and Ads</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              RoadShift is free to play and supported by ads. Ads use Google AdMob. You can manage your ad privacy choices below.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.row}
            onPress={async () => {
              const opened = await showPrivacyOptions();
              if (!opened) {
                // Consent form not available in this region — open in-app privacy policy instead
                navigation.navigate('PrivacyPolicy');
              }
            }}
          >
            <Text style={styles.rowLabel}>Ad Privacy Options</Text>
            <Text style={styles.rowSub}>Manage ad preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.rowLabel}>Privacy Policy</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('About')}>
            <Text style={styles.rowLabel}>About RoadShift</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowSub}>{APP_VERSION}</Text>
          </View>

          <Text style={styles.sectionTitle}>Data</Text>

          <TouchableOpacity style={[styles.row, styles.dangerRow]} onPress={confirmReset}>
            <Text style={styles.dangerText}>Reset All Progress</Text>
          </TouchableOpacity>

          <Text style={styles.resetWarning}>
            Resetting removes all level completion data, stars, achievements, and settings from this device. It cannot be undone.
          </Text>
        </ScrollView>
      </SafeAreaView>
      <View style={styles.bannerSlot}>
        <BannerAdComponent />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.background },
  safe:          { flex: 1 },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backText:      { color: Colors.primary, fontSize: 15 },
  headerTitle:   { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  scroll:        { padding: 16, gap: 4, paddingBottom: 32 },
  sectionTitle:  { fontSize: 12, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  row:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: Colors.border, marginBottom: 6 },
  rowLabel:      { fontSize: 15, color: Colors.textPrimary },
  rowSub:        { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  infoBox:       { backgroundColor: Colors.surfaceAlt, borderRadius: 10, padding: 14, marginBottom: 6 },
  infoText:      { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  dangerRow:     { borderColor: Colors.danger + '55' },
  dangerText:    { fontSize: 15, color: Colors.danger, fontWeight: '600' },
  resetWarning:  { fontSize: 12, color: Colors.textMuted, lineHeight: 18, marginTop: 4 },
  bannerSlot:    { alignItems: 'center', paddingBottom: 8 },
});
