import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    tertiary: true;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    tertiary: true;
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0B6BCB',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6B7280',
      contrastText: '#FFFFFF',
    },
    tertiary: {
      main: '#22C55E',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    warning: {
      main: '#F57C00',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#4B5563',
    },
  },
  shape: {
    borderRadius: 24,
  },
  typography: {
    fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(','),
    h3: {
      fontWeight: 900,
    },
    h5: {
      fontWeight: 700,
    },
    body1: {
      fontSize: '1rem',
    },
  },
});
