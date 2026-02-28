import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '@/constants/theme';

export default function BootText() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 700,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.Text style={[styles.text, { opacity }]}>
      The app is currently booting up...
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.2,
    marginTop: -20,
  },
});
