export const colors = {
  background: {
    primary: '#FFF',
    base: 'rgba(17, 23, 43, 0.04)',
    primaryInverse: 'rgba(255, 255, 255, 0.04)',
    baseInverse: '#11172B',
    brandPrimary: '#1ea7fd',
  },
  line: {
    light: 'rgba(17, 23, 43, 0.12)',
    dark: 'rgba(255, 255, 255, 0.08)',
  },
  text: {
    primary: '#11172B',
    secondary: 'rgba(17, 23, 43, 0.80)',
    disabled: 'rgba(17, 23, 43, 0.65)',
    primaryInverse: '#FFF',
    secondaryInverse: 'rgba(255, 255, 255, 0.75)',
    disabledInverse: 'rgba(255, 255, 255, 0.50)',
  },
} as const;

export type ColorCategory = keyof typeof colors;
export type ColorToken<C extends ColorCategory> = keyof (typeof colors)[C];
