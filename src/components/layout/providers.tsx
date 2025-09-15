'use client';
import React from 'react';
import { ActiveThemeProvider } from '../active-theme';
import { SessionProvider } from 'next-auth/react';
import QueryClientProvider from '../query-client-provider';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <SessionProvider>{children}</SessionProvider>
      </ActiveThemeProvider>
    </QueryClientProvider>
  );
}
