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
      main: '#ffffff',
    },
    background: {
      default: '#0a0f1e',
      paper: '#0f1628',
    },
    text: {
      primary: '#f1f0f5',
      secondary: '#8b8a9b',
    },
    divider: 'rgba(167, 139, 250, 0.1)',
    error: {
      main: '#f87171',
    },
    success: {
      main: '#34d399',
    },
    warning: {
      main: '#fbbf24',
    },
  },

  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: { fontWeight: 600, letterSpacing: '-0.02em' },
    h2: { fontWeight: 600, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    body1: { fontSize: '0.95rem', lineHeight: 1.6 },
    body2: { fontSize: '0.85rem', lineHeight: 1.5 },
    button: { fontWeight: 500, letterSpacing: '0.01em' },
  },

  shape: {
    borderRadius: 10,
  },

  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.4)',
    '0 2px 4px rgba(0,0,0,0.4)',
    '0 4px 8px rgba(0,0,0,0.3)',
    '0 6px 12px rgba(0,0,0,0.3)',
    '0 8px 16px rgba(0,0,0,0.2)',
    '0 10px 20px rgba(0,0,0,0.2)',
    '0 12px 24px rgba(0,0,0,0.2)',
    '0 14px 28px rgba(0,0,0,0.2)',
    '0 16px 32px rgba(0,0,0,0.2)',
    '0 18px 36px rgba(0,0,0,0.2)',
    '0 20px 40px rgba(0,0,0,0.2)',
    '0 22px 44px rgba(0,0,0,0.2)',
    '0 24px 48px rgba(0,0,0,0.2)',
    '0 26px 52px rgba(0,0,0,0.2)',
    '0 28px 56px rgba(0,0,0,0.2)',
    '0 30px 60px rgba(0,0,0,0.2)',
    '0 32px 64px rgba(0,0,0,0.2)',
    '0 34px 68px rgba(0,0,0,0.2)',
    '0 36px 72px rgba(0,0,0,0.2)',
    '0 38px 76px rgba(0,0,0,0.2)',
    '0 40px 80px rgba(0,0,0,0.2)',
    '0 42px 84px rgba(0,0,0,0.2)',
    '0 44px 88px rgba(0,0,0,0.2)',
    '0 46px 92px rgba(0,0,0,0.2)',
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0a0f1e',
          backgroundImage: `
            radial-gradient(ellipse at 20% 20%, rgba(124, 58, 237, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(167, 139, 250, 0.04) 0%, transparent 50%)
          `,
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(167, 139, 250, 0.2) transparent',
        },
        '*::-webkit-scrollbar': {
          width: '6px',
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '*::-webkit-scrollbar-thumb': {
          background: 'rgba(167, 139, 250, 0.2)',
          borderRadius: '3px',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '9px 20px',
          fontSize: '0.9rem',
          transition: 'all 0.2s ease',
        },
        contained: {
          backgroundColor: '#a78bfa',
          color: '#0a0f1e',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#c4b5fd',
            boxShadow: 'none',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        outlined: {
          borderColor: 'rgba(167, 139, 250, 0.3)',
          color: '#a78bfa',
          '&:hover': {
            borderColor: '#a78bfa',
            backgroundColor: 'rgba(167, 139, 250, 0.06)',
          },
        },
        text: {
          color: '#a78bfa',
          '&:hover': {
            backgroundColor: 'rgba(167, 139, 250, 0.06)',
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,0.03)',
            fontSize: '0.92rem',
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.1)',
              transition: 'border-color 0.2s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(167, 139, 250, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#a78bfa',
              borderWidth: '1px',
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.9rem',
            color: '#8b8a9b',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#a78bfa',
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#0f1628',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14,
          boxShadow: 'none',
          transition: 'border-color 0.2s ease',
          '&:hover': {
            borderColor: 'rgba(167, 139, 250, 0.2)',
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
          height: 26,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 15, 30, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: 'none',
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0f1628',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14,
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255,255,255,0.06)',
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1e2440',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6,
          fontSize: '0.78rem',
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(167, 139, 250, 0.08)',
          },
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0f1628',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.9rem',
          borderRadius: 6,
          margin: '2px 6px',
          '&:hover': {
            backgroundColor: 'rgba(167, 139, 250, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(167, 139, 250, 0.12)',
          },
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(167, 139, 250, 0.1)',
        },
        bar: {
          backgroundColor: '#a78bfa',
          borderRadius: 4,
        },
      },
    },
  },
});

export default theme;