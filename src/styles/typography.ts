export const typography = {
  display: {
    large: {
      fontFamily: 'Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif',
      fontWeight: 500,
      fontSize: '56px',
      lineHeight: '104%',
      letterSpacing: '-0.02rem',
    },
    medium: {
      fontFamily: 'Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif',
      fontWeight: 500,
      fontSize: '48px',
      lineHeight: '100%',
    },
    small: {
      fontFamily: 'Roboto, Inter, system-ui, -apple-system, sans-serif',
      fontWeight: 400,
      fontSize: '36px',
      lineHeight: '2.75rem',
    },
  },
  headline: {
    large: {
      fontFamily: 'Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif',
      fontWeight: 500,
      fontSize: '32px',
      lineHeight: '120%',
    },
    medium: {
      fontFamily: 'Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif',
      fontWeight: 500,
      fontSize: '28px',
      lineHeight: '120%',
    },
    small: {
      fontFamily: 'Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif',
      fontWeight: 500,
      fontSize: '20px',
      lineHeight: '120%',
    },
  },
  body: {
    large: {
      fontFamily: 'Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif',
      fontWeight: 500,
      fontSize: '24px',
      lineHeight: '145%',
      letterSpacing: '1%',
    },
    medium: {
      fontFamily: 'Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif',
      fontWeight: 500,
      fontSize: '18px',
      lineHeight: '145%',
      letterSpacing: '0.02rem',
    },
    small: {
      fontFamily: 'Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif',
      fontWeight: 500,
      fontSize: '16px',
      lineHeight: '145%',
      letterSpacing: '0.01rem',
    },
  },
  label: {
    small: {
      fontFamily: 'Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif',
      fontWeight: 500,
      fontSize: '14px',
      lineHeight: '1rem',
      letterSpacing: '0.01rem',
    },
  },
} as const;

export type TypographyVariant = keyof typeof typography;
export type TypographySize<V extends TypographyVariant> = keyof typeof typography[V];
