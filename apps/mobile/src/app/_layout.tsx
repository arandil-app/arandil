import { Slot } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <Slot />
    </QueryClientProvider>
  );
}
