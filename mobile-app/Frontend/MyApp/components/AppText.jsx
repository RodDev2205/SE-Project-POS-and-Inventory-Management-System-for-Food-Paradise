import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

export default function AppTextInput({
  label,
  error = null,
  style,
  rightIcon,
  onRightIconPress,
  ...rest
}) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, error ? styles.inputError : null, style]}
          placeholderTextColor={Colors.inputPlaceholder}
          autoCorrect={false}
          {...rest}
        />
        {rightIcon && onRightIconPress ? (
          <TouchableOpacity onPress={onRightIconPress} style={styles.iconButton}>
            <Ionicons name={rightIcon} size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.appleRed,
  },
  iconButton: {
    padding: Spacing.xs,
    position: 'absolute',
    right: Spacing.md,
  },
  errorText: {
    marginTop: Spacing.xs,
    fontSize: FontSize.xs,
    color: Colors.appleRed,
  },
});
