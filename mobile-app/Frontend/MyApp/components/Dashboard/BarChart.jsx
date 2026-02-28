import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 32;
const CHART_HEIGHT = 80;
const Y_LABELS = ['P40k', 'P20k', 'P0'];

export default function BarChart({ data }) {
  const maxVal = 100;

  return (
    <View style={styles.wrapper}>
      <View style={styles.chartRow}>
        <View style={styles.yAxis}>
          {Y_LABELS.map((label) => (
            <Text key={label} style={styles.yLabel}>{label}</Text>
          ))}
        </View>

        <View style={styles.barsArea}>
          <View style={[styles.gridLine, { top: 0 }]} />
          <View style={[styles.gridLine, { top: CHART_HEIGHT / 2 }]} />
          <View style={[styles.gridLine, { top: CHART_HEIGHT }]} />

          <View style={styles.barsRow}>
            {data.map((item, i) => {
              const barHeight = (item.value / maxVal) * CHART_HEIGHT;
              return (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: Colors.primaryGreen,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{item.day}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  yAxis: {
    width: 36,
    height: CHART_HEIGHT + 20,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  yLabel: {
    fontSize: 9,
    color: '#888',
    textAlign: 'right',
  },
  barsArea: {
    flex: 1,
    height: CHART_HEIGHT + 20,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    paddingTop: 0,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    gap: 4,
    paddingHorizontal: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: CHART_HEIGHT + 20,
    justifyContent: 'flex-end',
  },
  barBg: {
    flex: 1,
    width: '70%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 3,
  },
  dayLabel: {
    fontSize: 9,
    color: '#888',
    marginTop: 3,
    height: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginTop: 4,
  },
});
