import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Importar setup de TrackPlayer - se auto-ejecuta y registra servicio una sola vez
import '../config/trackPlayerSetup';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Manejar deep links de TrackPlayer notificación
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      
      // Si es el deep link de la notificación de TrackPlayer, ir al index
      if (url === 'trackplayer://notification.click' || 
          url.includes('trackplayer://notification') ||
          url.includes('la-max-955-app://')) {
        
        // Navegar al index usando Expo Router
        try {
          router.push('/');
        } catch (error) {
          console.error('❌ Error navegando al index:', error);
        }
      }
    };

    // Manejar deep links cuando la app ya está abierta
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Manejar deep link cuando la app se abre desde cerrada
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [router]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="info" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
