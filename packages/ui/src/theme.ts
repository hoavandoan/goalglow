import { createTokens } from 'tamagui'
import { tokens as tamaguiTokens } from '@tamagui/themes'
import { createTamagui, createTheme } from 'tamagui'
import { createInterFont } from '@tamagui/font-inter'
import { createMedia } from '@tamagui/react-native-media-driver'

// Create fonts
const headingFont = createInterFont({
  size: {
    6: 15,
    9: 32,
    10: 44,
  },
  transform: {
    6: 'uppercase',
    7: 'none',
  },
  weight: {
    6: '400',
    7: '700',
  },
  color: {
    6: '$colorFocus',
    7: '$color',
  },
  letterSpacing: {
    5: 2,
    6: 1,
    7: 0,
    8: -1,
    9: -2,
    10: -3,
    12: -4,
    14: -5,
    15: -6,
  },
  face: {
    700: { normal: 'InterBold' },
    800: { normal: 'InterBold' },
    900: { normal: 'InterBold' },
  },
})

const bodyFont = createInterFont(
  {
    face: {
      700: { normal: 'InterBold' },
    },
  },
  {
    sizeSize: (size) => Math.round(size * 1.1),
    sizeLineHeight: (size) => Math.round(size * 1.5),
  }
)

// Create theme tokens with green/white color scheme
export const tokens = createTokens({
  ...tamaguiTokens,
  color: {
    // Green shades
    green1: '#f2f9f2', // Lightest green
    green2: '#e5f3e5',
    green3: '#d7edd7',
    green4: '#c8e6c8',
    green5: '#a9d8a9',
    green6: '#8bc98b',
    green7: '#6cba6c',
    green8: '#4eab4e',
    green9: '#3c9c3c', // Main green
    green10: '#338a33',
    green11: '#297829',
    green12: '#1f661f', // Darkest green

    // Neutral shades
    white: '#ffffff',
    gray1: '#f8f9fa',
    gray2: '#f1f3f5',
    gray3: '#e9ecef',
    gray4: '#dee2e6',
    gray5: '#ced4da',
    gray6: '#adb5bd',
    gray7: '#868e96',
    gray8: '#495057',
    gray9: '#343a40',
    gray10: '#212529',
    black: '#000000',
  },
})

// Create themes
const lightTheme = createTheme({
  background: tokens.color.white,
  color: tokens.color.gray10,
  color1: tokens.color.gray9,
  color2: tokens.color.gray8,
  color3: tokens.color.gray7,
  color4: tokens.color.gray6,
  color5: tokens.color.gray5,
  color6: tokens.color.gray4,
  color7: tokens.color.gray3,
  color8: tokens.color.gray2,
  color9: tokens.color.gray1,
  color10: tokens.color.gray9,
  color11: tokens.color.gray8,
  color12: tokens.color.gray7,

  // Accents
  primary: tokens.color.green9,
  primaryHover: tokens.color.green10,
  primaryPress: tokens.color.green11,
  primaryFocus: tokens.color.green8,

  // Feedback states
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1',
})

const darkTheme = createTheme({
  background: tokens.color.gray10,
  color: tokens.color.gray1,
  color1: tokens.color.gray2,
  color2: tokens.color.gray3,
  color3: tokens.color.gray4,
  color4: tokens.color.gray5,
  color5: tokens.color.gray6,
  color6: tokens.color.gray7,
  color7: tokens.color.gray8,
  color8: tokens.color.gray9,
  color9: tokens.color.black,
  color10: tokens.color.gray2,
  color11: tokens.color.gray3,
  color12: tokens.color.gray4,

  // Accents
  primary: tokens.color.green8,
  primaryHover: tokens.color.green7,
  primaryPress: tokens.color.green6,
  primaryFocus: tokens.color.green9,

  // Feedback states
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
})

// Create full tamagui config
export const config = createTamagui({
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  }),
  // Default props for some components
  defaultProps: {
    Text: {
      selectable: true,
      size: '$4',
      color: '$color',
    },
    Button: {
      size: '$4',
      color: '$color12',
      fontFamily: '$body',
      backgroundColor: '$primary',
      // Add pressStyle for hover effect
      pressStyle: {
        backgroundColor: '$primaryPress',
      },
      hoverStyle: {
        backgroundColor: '$primaryHover',
      },
      focusStyle: {
        outlineColor: '$primaryFocus',
        outlineWidth: 2,
        outlineStyle: 'solid',
      },
    },
    Input: {
      size: '$4',
      fontFamily: '$body',
      borderWidth: 1,
      borderColor: '$color5',
      focusStyle: {
        borderColor: '$primary',
        outlineColor: '$primaryFocus',
        outlineWidth: 2,
        outlineStyle: 'solid',
      },
    },
    Select: {
      size: '$4',
      fontFamily: '$body',
      borderWidth: 1,
      borderColor: '$color5',
      focusStyle: {
        borderColor: '$primary',
      },
    },
    Checkbox: {
      size: '$4',
      borderWidth: 1,
      borderColor: '$color5',
      focusStyle: {
        borderColor: '$primary',
        outlineColor: '$primaryFocus',
        outlineWidth: 2,
        outlineStyle: 'solid',
      },
    },
  },
})
