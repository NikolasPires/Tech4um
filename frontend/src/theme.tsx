import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    titleLarge: React.CSSProperties;
    titleMedium: React.CSSProperties;
    titleSmall: React.CSSProperties;
    labelLarge: React.CSSProperties;
    labelMedium: React.CSSProperties;
    labelSmall: React.CSSProperties;
    paragraphLarge: React.CSSProperties;
    paragraphMedium: React.CSSProperties;
    paragraphSmall: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    titleLarge?: React.CSSProperties;
    titleMedium?: React.CSSProperties;
    titleSmall?: React.CSSProperties;
    labelLarge?: React.CSSProperties;
    labelMedium?: React.CSSProperties;
    labelSmall?: React.CSSProperties;
    paragraphLarge?: React.CSSProperties;
    paragraphMedium?: React.CSSProperties;
    paragraphSmall?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    titleLarge: true;
    titleMedium: true;
    titleSmall: true;
    labelLarge: true;
    labelMedium: true;
    labelSmall: true;
    paragraphLarge: true;
    paragraphMedium: true;
    paragraphSmall: true;
  }
}

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
    gray: Palette['primary'];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
    gray?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    tertiary: true;
    gray: true;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    tertiary: true;
    gray: true;
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1799F6',
      dark: '#1772B2',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#EB520E',
      dark: '#B8400B',
      contrastText: '#FFFFFF',
    },
    tertiary: {
      main: '#22C55E',
      contrastText: '#FFFFFF',
    },
    gray: {
      dark: 'rgba(0,0,0,0.87)',
      main: 'rgba(0,0,0,0.54)',
      light: 'rgba(0,0,0,0.25)',
    },
    background: {
      default: '#F3F3F3',
      paper: '#FFFFFF',
    },
    warning: {
      main: '#F57C00',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: 'rgba(0,0,0,0.87)',
      secondary: 'rgba(0,0,0,0.54)',
    },
  },
  shape: {
    borderRadius: 24,
  },
  typography: {
    fontFamily: ['Poppins', 'sans-serif'].join(','),
    
    h3: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
      fontSize: '48px',
      fontWeight: 900,
      lineHeight: '56px',
    },
    h5: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: '32px',
    },
    body1: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '24px',
    },

    titleLarge: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
      fontSize: '32px',
      fontWeight: 800,
      lineHeight: '36px',
    },
    titleMedium: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
      fontSize: '24px',
      fontWeight: 800,
      lineHeight: '28px',
    },
    titleSmall: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
      fontSize: '20px',
      fontWeight: 700,
      lineHeight: '24px',
    },

    labelLarge: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: '20px',
    },
    labelMedium: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '16px',
    },
    labelSmall: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '16px',
    },

    paragraphLarge: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
      fontSize: '20px',
      fontWeight: 400,
      lineHeight: '32px',
    },
    paragraphMedium: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '24px',
    },
    paragraphSmall: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '16px',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: ['Poppins', 'sans-serif'].join(','), 
          fontSize: '16px',
          lineHeight: '24px',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: ['Poppins', 'sans-serif'].join(','),
          fontSize: '16px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          fontSize: '16px',
        },
      },
    },
  },
});