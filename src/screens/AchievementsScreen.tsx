import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { GameStorage } from '../storage/gameStorage';
import { Achievement } from '../types/game';

type Props = NativeStackScreenProps<RootStackParamList, 'Achievements'>;

export default function AchievementsScreen({ navigation }: Props) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    GameStorage.loadAchievements().then(setAchievements);
  }, []);

  const unlocked = achievements.filter(a => a.unlocked).length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Achievements</Text>
          <Text style={styles.count}>{unlocked} / {achievements.length}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {achievements.map(a => (
            <View key={a.id} style={[styles.card, a.unlocked && styles.cardUnlocked]}>
              <Text style={styles.icon}>{a.unlocked ? '✅' : '🔒'}</Text>
              <View style={styles.text}>
                <Text style={[styles.name, a.unlocked && styles.nameUnlocked]}>{a.name}</Text>
                <Text style={styles.desc}>{a.description}</Text>
                {a.unlockedAt && (
                  <Text style={styles.date}>{new Date(a.unlockedAt).toLocaleDateString()}</Text>
                )}
              </View>
            </View>
          ))}
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
  count:        { color: Colors.accent, fontWeight: '700' },
  scroll:       { padding: 16, gap: 10, paddingBottom: 32 },
  card:         { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border, opacity: 0.6 },
  cardUnlocked: { opacity: 1, borderColor: Colors.accent + '55' },
  icon:         { fontSize: 28 },
  text:         { flex: 1, gap: 2 },
  name:         { fontSize: 15, fontWeight: '700', color: Colors.textMuted },
  nameUnlocked: { color: Colors.textPrimary },
  desc:         { fontSize: 13, color: Colors.textMuted },
  date:         { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
});
