import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Tipos para las notificaciones
export interface PushNotification {
  title: string;
  body: string;
  data?: any;
  sound?: string;
  categoryId?: string;
}

// Tipos básicos para evitar errores de TypeScript
interface NotificationSubscription {
  remove: () => void;
}

interface NotificationContent {
  title: string;
  body: string;
  data?: any;
}

interface NotificationRequest {
  content: NotificationContent;
}

interface BasicNotification {
  request: NotificationRequest;
}

interface NotificationResponse {
  notification: BasicNotification;
}

// Hook para manejar notificaciones push
export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [notification, setNotification] = useState<any>(false);
  const [isNotificationsAvailable, setIsNotificationsAvailable] = useState(false);
  const [isExpoGoMode, setIsExpoGoMode] = useState(false);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  // Callbacks para la navegación (se setean desde el componente principal)
  const [onNotificationReceived, setOnNotificationReceived] = useState<((data: any) => void) | null>(null);
  const [onNotificationPressed, setOnNotificationPressed] = useState<((data: any) => void) | null>(null);

  useEffect(() => {
    initializeNotifications();
  }, []);

  // Inicializar notificaciones si las dependencias están disponibles
  async function initializeNotifications() {
    try {
      // Verificar si las dependencias están disponibles
      const Device = require('expo-device');
      const Notifications = require('expo-notifications');
      
      // Verificar si estamos en Expo Go (limitado)
      const isExpoGo = !Device.isDevice || __DEV__;
      setIsExpoGoMode(isExpoGo);
      
      if (isExpoGo) {
        console.warn('⚠️ Modo Expo Go detectado - Solo notificaciones locales disponibles');
        console.warn('📱 Para push completo usar: eas build --profile development');
      }
      
      // Configurar el comportamiento de las notificaciones
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      setIsNotificationsAvailable(true);

      // Registrar para notificaciones
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        
        // Solo intentar enviar al servidor si no estamos en Expo Go
        if (!isExpoGo) {
          sendTokenToServer(token);
        } 
      }

      // Configurar listeners
      notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
        setNotification(notification);
        handleNotificationReceived(notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
        handleNotificationResponse(response);
      });

    } catch (error) {
      console.warn('⚠️ Notificaciones no disponibles:', error);
      setIsNotificationsAvailable(false);
    }
  }

  // Función para registrar el dispositivo para notificaciones
  async function registerForPushNotificationsAsync() {
    try {
      const Device = require('expo-device');
      const Notifications = require('expo-notifications');
      
      let token;

      if (Platform.OS === 'android') {
        // Canal por defecto
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Máxima FM - General',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6c5ce7',
        });

        // Canal para livestreams
        await Notifications.setNotificationChannelAsync('live', {
          name: 'Máxima FM - En Vivo',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#ff6b6b',
          sound: 'default'
        });

        // Canal para programas
        await Notifications.setNotificationChannelAsync('programs', {
          name: 'Máxima FM - Programas',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#a29bfe',
        });

        // Canal para urgentes
        await Notifications.setNotificationChannelAsync('urgent', {
          name: 'Máxima FM - Urgente',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 100, 100, 100, 100, 100],
          lightColor: '#ff4757',
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          setIsPermissionGranted(false);
          return null;
        }
        
        setIsPermissionGranted(true);
        token = (await Notifications.getExpoPushTokenAsync()).data;
      } else {
      }

      return token;
    } catch (error) {
        console.log('❌ Error registrando para notificaciones:', error);
      return null;
    }
  }

  // Enviar token al servidor/dashboard
  async function sendTokenToServer(token: string) {
    try {
      // Aquí enviarías el token a tu dashboard/servidor
      // Por ahora solo lo almacenamos localmente
      
      // Ejemplo de cómo enviar a tu dashboard:
      /*
      const response = await fetch('https://tu-dashboard.com/api/register-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          appVersion: '1.0.0',
          deviceInfo: {
            brand: Device.brand,
            modelName: Device.modelName,
            osVersion: Device.osVersion
          }
        }),
      });
      
      if (response.ok) {
        console.log('✅ Dispositivo registrado en el dashboard');
      }
      */
    } catch (error) {
      console.log('❌ Error enviando token al servidor:', error);
    }
  }

  // Manejar cuando llega una notificación (app abierta)
  function handleNotificationReceived(notification: any) {
    const { data } = notification.request.content;
    
    // Llamar callback personalizado si existe
    if (onNotificationReceived) {
      onNotificationReceived(data);
    }
    
    // Lógica según el tipo de notificación
    switch (data?.type) {
      case 'live_stream':
        console.log('🔴 Notificación de livestream recibida');
        break;
      case 'new_program':
        console.log('📺 Notificación de nuevo programa');
        break;
      case 'breaking_news':
        console.log('🚨 Notificación de última hora');
        break;
      case 'urgent':
        console.log('⚠️ Notificación urgente');
        break;
      default:
        console.log('📱 Notificación general');
    }
  }

  // Manejar cuando el usuario toca una notificación
  function handleNotificationResponse(response: any) {
    const { data } = response.notification.request.content;
        
    // Llamar callback personalizado si existe
    if (onNotificationPressed) {
      onNotificationPressed(data);
    }
    
    // Navegación automática según el tipo
    switch (data?.type) {
      case 'live_stream':
        console.log('🔴 Abriendo livestream desde notificación');
        // El callback debe manejar cambiar a modo video y seleccionar el video
        break;
      case 'new_program':
        console.log('📺 Navegando a programas desde notificación');
        break;
      case 'breaking_news':
      case 'urgent':
        console.log('🚨 Abriendo contenido urgente desde notificación');
        break;
    }
  }

  // Función para mostrar notificación local (para testing)
  async function showLocalNotification(notification: PushNotification) {
    if (!isNotificationsAvailable) {
      console.warn('⚠️ Notificaciones no disponibles para testing');
      return;
    }

    try {
      const Notifications = require('expo-notifications');
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound || 'default',
        },
        trigger: { seconds: 1 },
      });
      
      console.log('✅ Notificación local programada');
    } catch (error) {
      console.log('❌ Error mostrando notificación local:', error);
    }
  }

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (notificationListener.current) {
        try {
          const Notifications = require('expo-notifications');
          Notifications.removeNotificationSubscription(notificationListener.current);
        } catch (error) {
          // Ignorar errores de cleanup
        }
      }
      if (responseListener.current) {
        try {
          const Notifications = require('expo-notifications');
          Notifications.removeNotificationSubscription(responseListener.current);
        } catch (error) {
          // Ignorar errores de cleanup
        }
      }
    };
  }, []);

  return {
    // Estados
    expoPushToken,
    isPermissionGranted,
    notification,
    isNotificationsAvailable,
    isExpoGoMode,
    
    // Funciones
    showLocalNotification,
    initializeNotifications,
    
    // Setters para callbacks (para integrar con la navegación de la app)
    setOnNotificationReceived,
    setOnNotificationPressed
  };
} 