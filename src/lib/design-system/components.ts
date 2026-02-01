export const componentDefaults = {
  button: {
    primary: {
      padding: 'var(--space-8, 8px) var(--space-16, 16px)',
      backgroundColor: 'var(--color-primary, #f7d25a)',
      color: 'var(--color-btn-primary-text, #000)',
      borderRadius: 'var(--radius-base, 8px)',
      fontSize: 'var(--font-size-base, 16px)',
      fontWeight: 'var(--font-weight-medium, 500)',
      transition: 'all var(--duration-normal, 200ms) var(--ease-standard, ease-out)',
      border: 'none',
      cursor: 'pointer',
    },
    secondary: {
      padding: 'var(--space-8, 8px) var(--space-16, 16px)',
      backgroundColor: 'transparent',
      color: 'var(--color-text, #fff)',
      borderRadius: 'var(--radius-base, 8px)',
      fontSize: 'var(--font-size-base, 16px)',
      fontWeight: 'var(--font-weight-medium, 500)',
      transition: 'all var(--duration-normal, 200ms) var(--ease-standard, ease-out)',
      border: '1px solid var(--color-border, rgba(255,255,255,0.2))',
      cursor: 'pointer',
    },
    ghost: {
      padding: 'var(--space-8, 8px) var(--space-16, 16px)',
      backgroundColor: 'transparent',
      color: 'var(--color-text, #fff)',
      borderRadius: 'var(--radius-base, 8px)',
      fontSize: 'var(--font-size-base, 16px)',
      fontWeight: 'var(--font-weight-medium, 500)',
      transition: 'all var(--duration-normal, 200ms) var(--ease-standard, ease-out)',
      border: 'none',
      cursor: 'pointer',
    },
  },

  card: {
    container: {
      backgroundColor: 'var(--color-surface, rgba(0,0,0,0.4))',
      borderRadius: 'var(--radius-lg, 12px)',
      border: '1px solid var(--color-card-border, rgba(255,255,255,0.1))',
      boxShadow: 'var(--shadow-sm, 0 2px 4px rgba(0,0,0,0.1))',
      transition: 'all var(--duration-normal, 200ms) var(--ease-standard, ease-out)',
      padding: 'var(--space-16, 16px)',
    },
    interactive: {
      backgroundColor: 'var(--color-surface, rgba(0,0,0,0.4))',
      borderRadius: 'var(--radius-lg, 12px)',
      border: '1px solid var(--color-card-border, rgba(255,255,255,0.1))',
      boxShadow: 'var(--shadow-sm, 0 2px 4px rgba(0,0,0,0.1))',
      transition: 'all var(--duration-normal, 200ms) var(--ease-standard, ease-out)',
      padding: 'var(--space-16, 16px)',
      cursor: 'pointer',
    },
  },

  input: {
    base: {
      padding: 'var(--space-8, 8px) var(--space-12, 12px)',
      fontSize: 'var(--font-size-md, 14px)',
      borderRadius: 'var(--radius-base, 8px)',
      border: '1px solid var(--color-border, rgba(255,255,255,0.2))',
      backgroundColor: 'var(--color-surface, rgba(0,0,0,0.4))',
      color: 'var(--color-text, #fff)',
      transition: 'all var(--duration-fast, 150ms) var(--ease-standard, ease-out)',
      outline: 'none',
    },
  },

  badge: {
    default: {
      padding: 'var(--space-4, 4px) var(--space-8, 8px)',
      fontSize: 'var(--font-size-sm, 12px)',
      fontWeight: 'var(--font-weight-medium, 500)',
      borderRadius: 'var(--radius-full, 9999px)',
      backgroundColor: 'var(--color-surface, rgba(255,255,255,0.1))',
      color: 'var(--color-text, #fff)',
    },
    primary: {
      padding: 'var(--space-4, 4px) var(--space-8, 8px)',
      fontSize: 'var(--font-size-sm, 12px)',
      fontWeight: 'var(--font-weight-medium, 500)',
      borderRadius: 'var(--radius-full, 9999px)',
      backgroundColor: 'var(--color-primary, #f7d25a)',
      color: 'var(--color-btn-primary-text, #000)',
    },
  },
}

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
}

export const typography = {
  fontFamily: {
    sans: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
    mono: 'var(--font-mono, ui-monospace, monospace)',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
}

export const colors = {
  primary: '#f7d25a',
  primaryHover: '#f0b840',
  background: '#0a0a0a',
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceHover: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.1)',
  text: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textSecondary: 'rgba(255, 255, 255, 0.4)',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
}

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glow: (color: string) => `0 0 20px ${color}40, 0 0 40px ${color}20`,
}

export const radii = {
  none: '0',
  sm: '4px',
  base: '8px',
  md: '10px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
}

export const transitions = {
  fast: '150ms ease-out',
  normal: '200ms ease-out',
  slow: '300ms ease-out',
  spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
}

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

export const zIndex = {
  dropdown: 50,
  sticky: 100,
  fixed: 200,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
}
