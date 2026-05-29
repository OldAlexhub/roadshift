import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

const POLICY = `PRIVACY POLICY

RoadShift: Traffic Puzzle
Developer: Old Alex Hub
Effective Date: See PRIVACYPOLICY.md for current date.

This Privacy Policy describes how Old Alex Hub handles information in connection with the RoadShift: Traffic Puzzle mobile application.

INFORMATION COLLECTED

RoadShift does not require an account and does not collect personal information such as your name, email address, phone number, or location.

Gameplay progress, settings, and achievements are stored locally on your device using the device's local storage. This data does not leave your device through the app itself.

ADVERTISING

RoadShift is free to play and is supported by advertising through Google AdMob. The Google AdMob SDK may collect and process data to serve ads, including device identifiers and usage data. This data collection is governed by Google's privacy policy and applicable privacy laws.

If you are located in a region where consent is required, a consent dialog will appear when you first launch the app. You can revisit ad privacy choices through Settings at any time.

INTERNET USE

The app uses internet connectivity solely for advertising purposes. All gameplay functions work offline without any internet connection.

PERMISSIONS

RoadShift requests only:
- Internet access: Required for advertising.
- Network state access: May be required by the advertising SDK.

No location, camera, microphone, contacts, storage, notification, or other sensitive permissions are requested.

DATA DELETION

Gameplay data is stored locally on your device. You can delete it by:
- Using the "Reset All Progress" option in Settings.
- Clearing the app's data through your device's app management settings.
- Uninstalling the application.

CHILDREN

RoadShift is not directed at children under 13. We do not knowingly collect personal information from children.

BACKEND SERVICES

Old Alex Hub does not operate a server or backend service for RoadShift. No gameplay data is transmitted to our servers. Third-party advertising services may process data under their own privacy policies.

CONTACT

For privacy questions, please contact the developer through the Google Play Store listing.`;

export default function PrivacyPolicyScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={{ width: 50 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.policy}>{POLICY}</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  safe:        { flex: 1 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backText:    { color: Colors.primary, fontSize: 15 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  scroll:      { padding: 20, paddingBottom: 40 },
  policy:      { fontSize: 13, color: Colors.textSecondary, lineHeight: 21 },
});
