'use client';
import React, { ReactNode } from 'react';
import { QueryClientProvider as ReactQueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';

const QueryClientProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = getQueryClient();

  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  );
};

export default QueryClientProvider;
