import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useTrackPlayerNotifications } from '@/hooks/useTrackPlayerNotifications';
import { TVFocusProvider } from '@/contexts/TVFocusContext';

// Importar setup de TrackPlayer - se auto-ejecuta y registra servicio una sola vez
import '../config/trackPlayerSetup';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Integrar manejo de notificaciones de TrackPlayer sin interferir con expo-router
  useTrackPlayerNotifications();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Deep links ahora son manejados por +native-intent.tsx de forma segura
  // No necesitamos configurar Linking aquí para evitar conflictos con expo-router

  if (!loaded) {
    return null;
  }

  return (
    <TVFocusProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="info" />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </TVFocusProvider>
  );
}
