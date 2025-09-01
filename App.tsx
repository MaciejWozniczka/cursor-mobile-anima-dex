import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from 'react-query';

import { COLORS } from '@/utils/constants';
import { AuthState } from '@/types';
import AuthService from '@/services/auth';
import AppNavigator from '@/navigation/AppNavigator';
import LoadingScreen from '@/components/common/LoadingScreen';

// Tworzenie instancji QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minut
      cacheTime: 10 * 60 * 1000, // 10 minut
    },
  },
});

export default function App() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const initialState = await AuthService.initialize();
      setAuthState(initialState);
    } catch (error) {
      console.error('Error initializing app:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Błąd inicjalizacji aplikacji',
      });
    }
  };

  const updateAuthState = (newState: AuthState) => {
    setAuthState(newState);
  };

  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor={COLORS.primary} />
          <AppNavigator authState={authState} updateAuthState={updateAuthState} />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
