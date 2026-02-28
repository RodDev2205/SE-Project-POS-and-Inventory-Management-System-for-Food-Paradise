import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Spacing } from '@/constants/theme';

const SIZE_MAP = {
    xsmall: { width: 160, height: 64, subtitle: 12 },
    small: { width: 220, height: 110, subtitle: 14 },
    medium: { width: 340, height: 170, subtitle: 18 },
    large: { width: 380, height: 190, subtitle: 20},
};

export default function FoodParadiseLogo ({ 
    size = 'medium',
    showSubtitle = true, 
    align = 'center',
}) {
    const s = SIZE_MAP[size];
    const alignStyle = align === 'left' ? styles.leftAlign : styles.centerAlign;

    return (
        <View style={[styles.container, alignStyle]}>
            <Image
            source={require('@/assets/images/logo.png')}
            style={{ width: s.width, height: s.height}}
            contentFit="contain" 
            />
            {showSubtitle && (
                <Text
                    style={[
                        styles.subtitle,
                        { fontSize: s.subtitle, width: s.width, textAlign: 'center' },
                    ]}
                >
                    Management App
                </Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create ({
    container: {
        justifyContent: 'center',
        marginBottom: -10,  
    },
    leftAlign: {
        alignItems: 'flex-start',
    },
    centerAlign: {
        alignItems: 'center',
    },
    subtitle: {
        color: Colors.textSecondary,
        marginTop: 2,
        letterSpacing: 0.4,
        fontWeight: '600',
    }
})
