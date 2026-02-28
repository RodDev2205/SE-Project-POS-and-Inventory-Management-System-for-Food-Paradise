import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

const themePalette = {
  light: {
    text: Colors.textPrimary,
    background: Colors.white,
  },
  dark: {
    text: Colors.white,
    background: '#111111',
  },
};

export function useThemeColor(props, colorName) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return themePalette[theme][colorName];
}
