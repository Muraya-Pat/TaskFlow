import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#a78bfa',
      light: '#c4b5fd',
      dark: '#7c3aed',
    },
    secondary: {
      main: '#e8eaf2',
    },
    background: {
      default: '#161b2e',
      paper: '#252d42',
    },
    text: {
      primary: '#e8eaf2',
      secondary: '#8892a4',
    },
    divider: 'rgba(167,139,250,0.08)',
    error:   { main: '#f87171' },
    success: { main: '#34d399' },
    warning: { main: '#f59e0b' },
  },

  typography: {
    fontFamily: 'var(--font-raleway), "Roboto", sans-serif',
    fontSize: 16,
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    body1: { fontSize: '1.05rem', lineHeight: 1.7 },
    body2: { fontSize: '0.95rem', lineHeight: 1.6 },
    button: { fontWeight: 700, letterSpacing: '0.01em' },
  },

  shape: { borderRadius: 10 },

  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.35)',
    '0 2px 6px rgba(0,0,0,0.35)',
    '0 4px 12px rgba(0,0,0,0.3)',
    '0 6px 16px rgba(0,0,0,0.3)',
    '0 8px 20px rgba(0,0,0,0.25)',
    '0 10px 24px rgba(0,0,0,0.25)',
    '0 12px 28px rgba(0,0,0,0.25)',
    '0 14px 32px rgba(0,0,0,0.2)',
    '0 16px 36px rgba(0,0,0,0.2)',
    '0 18px 40px rgba(0,0,0,0.2)',
    '0 20px 44px rgba(0,0,0,0.2)',
    '0 22px 48px rgba(0,0,0,0.2)',
    '0 24px 52px rgba(0,0,0,0.2)',
    '0 26px 56px rgba(0,0,0,0.2)',
    '0 28px 60px rgba(0,0,0,0.2)',
    '0 30px 64px rgba(0,0,0,0.2)',
    '0 32px 68px rgba(0,0,0,0.2)',
    '0 34px 72px rgba(0,0,0,0.2)',
    '0 36px 76px rgba(0,0,0,0.2)',
    '0 38px 80px rgba(0,0,0,0.2)',
    '0 40px 84px rgba(0,0,0,0.2)',
    '0 42px 88px rgba(0,0,0,0.2)',
    '0 44px 92px rgba(0,0,0,0.2)',
    '0 46px 96px rgba(0,0,0,0.2)',
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0d1117',
          minHeight: '100vh',
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(167,139,250,0.2) transparent',
        },
        '*::-webkit-scrollbar': { width: '6px' },
        '*::-webkit-scrollbar-track': { background: 'transparent' },
        '*::-webkit-scrollbar-thumb': {
          background: 'rgba(167,139,250,0.2)',
          borderRadius: '3px',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '9px 20px',
          fontSize: '0.9rem',
          transition: 'all 0.2s ease',
        },
        contained: {
          backgroundColor: '#a78bfa',
          color: '#0d1117',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#c4b5fd',
            boxShadow: '0 4px 16px rgba(167,139,250,0.35)',
            transform: 'translateY(-1px)',
          },
          '&:active': { transform: 'translateY(0)' },
        },
        outlined: {
          borderColor: 'rgba(167,139,250,0.25)',
          color: '#a78bfa',
          '&:hover': {
            borderColor: '#a78bfa',
            backgroundColor: 'rgba(167,139,250,0.08)',
          },
        },
        text: {
          color: '#a78bfa',
          '&:hover': { backgroundColor: 'rgba(167,139,250,0.08)' },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,0.04)',
            fontSize: '0.95rem',
            color: '#e8eaf2',
            '& fieldset': {
              borderColor: 'rgba(167,139,250,0.15)',
              transition: 'border-color 0.2s ease',
            },
            '&:hover fieldset': { borderColor: 'rgba(167,139,250,0.35)' },
            '&.Mui-focused fieldset': { borderColor: '#a78bfa', borderWidth: '1.5px' },
          },
          '& .MuiInputLabel-root': { fontSize: '0.9rem', color: '#8892a4' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#a78bfa' },
          '& .MuiOutlinedInput-input': { color: '#e8eaf2' },
          '& .MuiOutlinedInput-input::placeholder': { color: 'rgba(136,146,164,0.6)' },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#252d42',
          border: '1px solid rgba(167,139,250,0.08)',
          borderRadius: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.15s ease',
          '&:hover': {
            borderColor: 'rgba(167,139,250,0.18)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.78rem',
          height: 26,
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e2540',
          border: '1px solid rgba(167,139,250,0.12)',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          color: '#e8eaf2',
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: '#e8eaf2',
          fontWeight: 700,
          fontSize: '1.1rem',
        },
      },
    },

    MuiDialogContentText: {
      styleOverrides: {
        root: { color: '#8892a4' },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(167,139,250,0.08)' },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#0d1117',
          border: '1px solid rgba(167,139,250,0.15)',
          borderRadius: 6,
          fontSize: '0.78rem',
          color: '#e8eaf2',
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.2s ease',
          '&:hover': { backgroundColor: 'rgba(167,139,250,0.1)' },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          color: '#e8eaf2',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(167,139,250,0.15)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(167,139,250,0.35)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#a78bfa' },
        },
        icon: { color: '#8892a4' },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#8892a4',
          '&.Mui-focused': { color: '#a78bfa' },
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e2540',
          border: '1px solid rgba(167,139,250,0.12)',
          borderRadius: 10,
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.92rem',
          color: '#e8eaf2',
          borderRadius: 6,
          margin: '2px 6px',
          '&:hover': { backgroundColor: 'rgba(167,139,250,0.1)' },
          '&.Mui-selected': {
            backgroundColor: 'rgba(167,139,250,0.14)',
            color: '#a78bfa',
            fontWeight: 600,
          },
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, backgroundColor: 'rgba(167,139,250,0.12)' },
        bar:  { backgroundColor: '#a78bfa', borderRadius: 4 },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: '0.875rem',
          '&.MuiAlert-standardSuccess': {
            backgroundColor: 'rgba(52,211,153,0.1)',
            color: '#34d399',
            border: '1px solid rgba(52,211,153,0.2)',
          },
          '&.MuiAlert-standardError': {
            backgroundColor: 'rgba(248,113,113,0.1)',
            color: '#f87171',
            border: '1px solid rgba(248,113,113,0.2)',
          },
        },
      },
    },
  },
});

export default theme;
