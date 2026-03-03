import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 32;
const CHART_HEIGHT = 120;

export default function BarChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const maxVal = data && data.length ? Math.max(...data.map((d) => d.value)) : 0;
  const paddedMax = Math.max(1, maxVal * 1.1);

  const topLabel = Math.ceil(paddedMax / 1000) * 1000; // round to nearest 1k
  const midLabel = Math.round(topLabel / 2);
  const yLabels = [topLabel, midLabel, 0];

  const formatLabel = (v) => {
    if (v >= 1000) return `₱${(v / 1000).toFixed(0)}k`;
    return `₱${v}`;
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.chartRow}>
        <View style={styles.yAxis}>
          {yLabels.map((label) => (
            <Text key={String(label)} style={styles.yLabel}>
              {formatLabel(label)}
            </Text>
          ))}
        </View>

        <View style={styles.barsArea}>
          <View style={[styles.gridLine, { top: 0 }]} />
          <View style={[styles.gridLine, { top: CHART_HEIGHT / 2 }]} />
          <View style={[styles.gridLine, { top: CHART_HEIGHT }]} />

          <View style={styles.barsRow}>
            {data.map((item, i) => {
              const val = typeof item.value === 'number' ? item.value : 0;
              const barHeight = (val / (topLabel || 1)) * CHART_HEIGHT;
              const isActive = activeIndex === i;
              // place tooltip above the bar (horizontal label)
              const tooltipBottom = barHeight + 12;
              return (
                <View key={i} style={styles.barCol}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.barBg}
                    onPress={() => setActiveIndex(isActive ? null : i)}
                  >
                    {isActive && (
                      <View style={[styles.tooltip, { bottom: tooltipBottom }]}> 
                        <Text style={styles.tooltipText}>₱{(val).toLocaleString()}</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(2, barHeight),
                          backgroundColor: isActive ? Colors.primaryGreenDark : Colors.primaryGreen,
                        },
                      ]}
                    />
                  </TouchableOpacity>
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
    marginBottom: 12,
    paddingVertical: 6,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  yAxis: {
    width: 44,
    height: CHART_HEIGHT + 20,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  yLabel: {
    fontSize: 10,
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
    paddingHorizontal: 8,
  },
  tooltip: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 10,
  },
  barCol: {
    alignItems: 'center',
    height: CHART_HEIGHT + 20,
    justifyContent: 'flex-end',
    marginHorizontal: 10,
  },
  barBg: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 26,
    borderRadius: 6,
  },
  dayLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 10,
    height: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginTop: 4,
  },
  tooltip: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    minWidth: 64,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
