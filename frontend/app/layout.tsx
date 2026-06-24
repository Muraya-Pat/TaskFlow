'use client';

import { Raleway } from 'next/font/google';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../lib/theme';
import { AuthProvider } from '../context/AuthContext';

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-raleway',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={raleway.variable}>
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