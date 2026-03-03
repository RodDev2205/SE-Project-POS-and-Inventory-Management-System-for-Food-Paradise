import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 120;
const Y_AXIS_WIDTH = 36;

export default function LineChart({ data }) {
  // data: [{ day: 'M', value: number }, ... ]
  const w = width - 32 - Y_AXIS_WIDTH; // container padding
  const points = data && data.length ? data : [];
  const values = points.map((p) => Number(p.value) || 0);
  const max = Math.max(...values, 1);

  const stepX = w / Math.max(points.length - 1, 1);

  const svgPoints = points
    .map((p, i) => {
      const x = i * stepX;
      const y = CHART_HEIGHT - (Number(p.value) / max) * CHART_HEIGHT;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.yAxis} />
        <View style={styles.chartArea}>
          <Svg width={w} height={CHART_HEIGHT}>
            {/* grid lines */}
            <Line x1="0" y1={0} x2={w} y2={0} stroke="#eee" strokeWidth="1" />
            <Line x1="0" y1={CHART_HEIGHT / 2} x2={w} y2={CHART_HEIGHT / 2} stroke="#eee" strokeWidth="1" />
            <Line x1="0" y1={CHART_HEIGHT} x2={w} y2={CHART_HEIGHT} stroke="#eee" strokeWidth="1" />

            {/* filled polyline shadow */}
            <Polyline
              points={svgPoints}
              fill="none"
              stroke={Colors.primaryGreen}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* points */}
            {points.map((p, i) => {
              const x = i * stepX;
              const y = CHART_HEIGHT - (Number(p.value) / max) * CHART_HEIGHT;
              return <Circle key={i} cx={x} cy={y} r={3.5} fill={Colors.primaryGreenDark} />;
            })}
          </Svg>
          <View style={styles.labelsRow}>
            {points.map((p, i) => (
              <Text key={i} style={styles.labelText}>{p.day}</Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  yAxis: { width: Y_AXIS_WIDTH },
  chartArea: { flex: 1 },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 6 },
  labelText: { fontSize: 10, color: '#666' },
});
