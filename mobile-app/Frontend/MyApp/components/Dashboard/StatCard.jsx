import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 16 * 2 - 10) / 2; 

export default function StatCard({ label, value, dotColor, bg }) {
  return (
    <View style={[styles.card, { backgroundColor: bg, width: CARD_WIDTH }]}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.label} numberOfLines={2}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 72,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    color: '#444',
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginTop: 6,
  },
});
