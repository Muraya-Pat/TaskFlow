'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../lib/theme';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
           {children}
          </AuthProvider>          
        </ThemeProvider>
      </body>
    </html>
  );
}