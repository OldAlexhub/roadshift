import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  stars: 0 | 1 | 2 | 3;
  size?: number;
}

export default function StarDisplay({ stars, size = 24 }: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3].map(n => (
        <Text key={n} style={[styles.star, { fontSize: size, color: n <= stars ? Colors.starGold : Colors.starEmpty }]}>
          {n <= stars ? '★' : '☆'}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row:  { flexDirection: 'row', gap: 2 },
  star: { fontWeight: '700' },
});
