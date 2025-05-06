import { Platform } from 'react-native';

export const FONTS = {
  // Font aileleri
  FONT_FAMILY: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto',
    light: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Font stilleri
  h1: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    fontSize: 28,
    lineHeight: 34,
  },
  h2: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    fontSize: 24,
    lineHeight: 30,
  },
  h3: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontSize: 20,
    lineHeight: 26,
  },
  h4: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontSize: 17,
    lineHeight: 22,
  },
  h5: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontSize: 15,
    lineHeight: 20,
  },
  body1: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontSize: 16,
    lineHeight: 22,
  },
  body2: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontSize: 14,
    lineHeight: 18,
    textTransform: 'uppercase',
  },
};
