import messaging from '@react-native-firebase/messaging';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

import { APP_CONFIG, DASHBOARD_CONFIG } from '@/config/notifications';

const buildEndpointUrl = (baseUrl?: string, endpoint?: string) => {
  if (!baseUrl) {
    return null;
  }

  const sanitizedBase = baseUrl.replace(/\/+$|\/$/g, '');
  const sanitizedEndpoint = endpoint ? endpoint.replace(/^\/+/, '') : '';

  if (!sanitizedEndpoint) {
    return sanitizedBase;
  }

  return `${sanitizedBase}/${sanitizedEndpoint}`;
};

async function ensureDefaultNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    const Notifications = await import('expo-notifications');
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Máxima FM',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#6c5ce7',
    });
  } catch (error) {
    console.warn('⚠️ No se pudo configurar el canal default de notificaciones:', error);
  }
}

async function requestMessagingPermissions(): Promise<boolean> {
  let androidPermissionGranted = true;

  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;

      if (permission) {
        const alreadyGranted = await PermissionsAndroid.check(permission);
        if (!alreadyGranted) {
          const status = await PermissionsAndroid.request(permission);
          androidPermissionGranted = status === PermissionsAndroid.RESULTS.GRANTED;
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ Error solicitando POST_NOTIFICATIONS en Android:', error);
    androidPermissionGranted = false;
  }

  try {
    const authStatus = await messaging().requestPermission();
    const messagingEnabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return androidPermissionGranted && messagingEnabled;
  } catch (error) {
    console.error('❌ Error solicitando permisos de Firebase Messaging:', error);
    return false;
  }
}

export interface FirebaseNotification {
  title?: string;
  body?: string;
  data?: any;
  messageId?: string;
  from?: string;
}

export function useFirebaseNotifications() {
  const [fcmToken, setFcmToken] = useState<string>('');
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [lastNotification, setLastNotification] = useState<FirebaseNotification | null>(null);
  const [lastTokenSync, setLastTokenSync] = useState<number | null>(null);
  const [isSyncingToken, setIsSyncingToken] = useState(false);

  const [onNotificationReceived, setOnNotificationReceived] = useState<((notification: FirebaseNotification) => void) | null>(null);
  const [onNotificationPressed, setOnNotificationPressed] = useState<((notification: FirebaseNotification) => void) | null>(null);

  const registerListenerCleanup = useRef<(() => void) | null>(null);
  const registerDeviceUrl = useMemo(
    () => buildEndpointUrl(DASHBOARD_CONFIG.baseUrl, DASHBOARD_CONFIG.endpoints.registerDevice),
    []
  );

  useEffect(() => {
    initializeFirebaseMessaging();

    return () => {
      registerListenerCleanup.current?.();
    };
  }, []);

  const initializeFirebaseMessaging = async () => {
    try {
      const enabled = await requestMessagingPermissions();

      if (enabled) {
        setIsPermissionGranted(true);

        await ensureDefaultNotificationChannel();

        // 2. Obtener FCM token
        const token = await messaging().getToken();
        setFcmToken(token);

        // 3. Enviar token al servidor (opcional)
        await sendTokenToServer(token);

        // 4. Configurar listeners
        registerListenerCleanup.current = setupMessageListeners();

        // 5. Manejar notificación que abrió la app (cuando estaba cerrada)
        handleInitialNotification();

      } else {
        setIsPermissionGranted(false);
      }

    } catch (error) {
      console.error('❌ Error inicializando Firebase Messaging:', error);
    }
  };

  const setupMessageListeners = () => {
    // Listener para mensajes cuando la app está en FOREGROUND
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      
      const notification: FirebaseNotification = {
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
        messageId: remoteMessage.messageId,
        from: remoteMessage.from,
      };

      setLastNotification(notification);
      
      // Llamar callback si está configurado
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listener para cuando el usuario TOCA una notificación (app en background)
    const unsubscribeNotificationOpen = messaging().onNotificationOpenedApp(remoteMessage => {
      
      const notification: FirebaseNotification = {
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
        messageId: remoteMessage.messageId,
        from: remoteMessage.from,
      };

      // Llamar callback si está configurado
      if (onNotificationPressed) {
        onNotificationPressed(notification);
      }
    });

    // Listener para actualizaciones del token
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
      setFcmToken(token);
      sendTokenToServer(token).catch(error => {
        console.error('❌ Error enviando token actualizado al servidor:', error);
      });
    });

    // Cleanup function
    return () => {
      unsubscribeForeground();
      unsubscribeNotificationOpen();
      unsubscribeTokenRefresh();
    };
  };

  const handleInitialNotification = async () => {
    // Verificar si la app fue abierta desde una notificación (cuando estaba cerrada)
    const remoteMessage = await messaging().getInitialNotification();
    
    if (remoteMessage) {
      
      const notification: FirebaseNotification = {
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
        messageId: remoteMessage.messageId,
        from: remoteMessage.from,
      };

      // Llamar callback si está configurado
      if (onNotificationPressed) {
        onNotificationPressed(notification);
      }
    }
  };

  const sendTokenToServer = async (token: string) => {
    try {
      if (!registerDeviceUrl) {
        if (__DEV__) {
          console.log('ℹ️ No se envía token: DASHBOARD_CONFIG.baseUrl no está definido.');
        }
        return;
      }

      if (isSyncingToken) {
        return;
      }

      const now = Date.now();
      const FIVE_MINUTES = 5 * 60 * 1000;
      if (lastTokenSync && now - lastTokenSync < FIVE_MINUTES) {
        return;
      }

      setIsSyncingToken(true);

      const response = await fetch(registerDeviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          appVersion: APP_CONFIG.version,
          packageName: Platform.select({ android: APP_CONFIG.package.android, ios: APP_CONFIG.package.ios }),
          timestamp: now,
        }),
      });

      if (response.ok) {
        setLastTokenSync(now);
        if (__DEV__) {
          console.log('✅ Token FCM sincronizado con dashboard');
        }
      } else {
        let errorMessage = `Código ${response.status}`;
        try {
          errorMessage = await response.text();
        } catch (readError) {
          // Ignorar errores al leer el cuerpo
        }
        console.warn('⚠️ No se pudo registrar el token en el dashboard:', errorMessage);
      }

    } catch (error) {
      console.error('❌ Error enviando token al servidor:', error);
    } finally {
      setIsSyncingToken(false);
    }
  };

  // Suscribirse a un topic de Firebase
  const subscribeToTopic = async (topic: string) => {
    try {
      await messaging().subscribeToTopic(topic);
    } catch (error) {
      console.error(`❌ Error suscribiéndose al topic ${topic}:`, error);
    }
  };

  // Desuscribirse de un topic
  const unsubscribeFromTopic = async (topic: string) => {
    try {
      await messaging().unsubscribeFromTopic(topic);
    } catch (error) {
      console.error(`❌ Error desuscribiéndose del topic ${topic}:`, error);
    }
  };

  return {
    fcmToken,
    isPermissionGranted,
    lastNotification,
    setOnNotificationReceived,
    setOnNotificationPressed,
    subscribeToTopic,
    unsubscribeFromTopic,
  };
} 