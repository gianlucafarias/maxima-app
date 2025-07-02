import messaging from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react';

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

  // Callbacks para manejar notificaciones
  const [onNotificationReceived, setOnNotificationReceived] = useState<((notification: FirebaseNotification) => void) | null>(null);
  const [onNotificationPressed, setOnNotificationPressed] = useState<((notification: FirebaseNotification) => void) | null>(null);

  useEffect(() => {
    initializeFirebaseMessaging();
  }, []);

  const initializeFirebaseMessaging = async () => {
    try {
      // 1. Solicitar permisos
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ Firebase Messaging autorizado:', authStatus);
        setIsPermissionGranted(true);

        // 2. Obtener FCM token
        const token = await messaging().getToken();
        console.log('🔑 FCM Token:', token);
        setFcmToken(token);

        // 3. Enviar token al servidor (opcional)
        sendTokenToServer(token);

        // 4. Configurar listeners
        setupMessageListeners();

        // 5. Manejar notificación que abrió la app (cuando estaba cerrada)
        handleInitialNotification();

      } else {
        console.log('❌ Permisos de Firebase Messaging denegados');
        setIsPermissionGranted(false);
      }

    } catch (error) {
      console.error('❌ Error inicializando Firebase Messaging:', error);
    }
  };

  const setupMessageListeners = () => {
    // Listener para mensajes cuando la app está en FOREGROUND
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('🔔 Mensaje recibido en foreground:', remoteMessage);
      
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
      console.log('🔔 Notificación tocada (app en background):', remoteMessage);
      
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
      console.log('🔄 FCM Token actualizado:', token);
      setFcmToken(token);
      sendTokenToServer(token);
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
      console.log('🔔 App abierta desde notificación:', remoteMessage);
      
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
      console.log('📤 Enviando FCM token al servidor...');
      
      // Aquí implementarías el envío a tu servidor/dashboard
      // Ejemplo:
      /*
      const response = await fetch('https://tu-api.com/register-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fcmToken: token,
          platform: Platform.OS,
          appVersion: '1.0.0',
          timestamp: Date.now(),
        }),
      });

      if (response.ok) {
        console.log('✅ Token enviado al servidor correctamente');
      }
      */
      
    } catch (error) {
      console.error('❌ Error enviando token al servidor:', error);
    }
  };

  // Suscribirse a un topic de Firebase
  const subscribeToTopic = async (topic: string) => {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`✅ Suscrito al topic: ${topic}`);
    } catch (error) {
      console.error(`❌ Error suscribiéndose al topic ${topic}:`, error);
    }
  };

  // Desuscribirse de un topic
  const unsubscribeFromTopic = async (topic: string) => {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`✅ Desuscrito del topic: ${topic}`);
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