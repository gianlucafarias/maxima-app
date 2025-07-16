import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuración de canales de notificación para Android
export const setupNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    try {
      // Canal para controles de media
      await Notifications.setNotificationChannelAsync('media-controls', {
        name: 'Controles de Audio',
        description: 'Controles de reproducción de audio',
        importance: Notifications.AndroidImportance.LOW,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      // Canal para notificaciones generales de la app
      await Notifications.setNotificationChannelAsync('general', {
        name: 'Notificaciones Generales',
        description: 'Notificaciones generales de Máxima FM',
        importance: Notifications.AndroidImportance.DEFAULT,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

    } catch (error) {
      console.error('❌ Error configurando canales de notificación:', error);
    }
  }
};

// Configuración de metadatos para Now Playing
export interface MediaMetadata {
  title: string;
  artist: string;
  album: string;
  artwork?: string;
  duration?: number;
  isLiveStream?: boolean;
}

// Configuración por defecto para Máxima FM
export const DEFAULT_MEDIA_METADATA: MediaMetadata = {
  title: 'Máxima FM',
  artist: '95.5 FM - En Vivo',
  album: 'Radio en Vivo',
  isLiveStream: true,
  duration: 0, // 0 para live streams
};

// Configurar categorías de notificación para media controls
export const setupMediaControlCategories = async () => {
  try {
    // Categoría para cuando está reproduciendo
    await Notifications.setNotificationCategoryAsync('MEDIA_PLAYING', [
      {
        identifier: 'PAUSE_ACTION',
        buttonTitle: '⏸️ Pausar',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'STOP_ACTION',
        buttonTitle: '⏹️ Detener',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    // Categoría para cuando está pausado
    await Notifications.setNotificationCategoryAsync('MEDIA_PAUSED', [
      {
        identifier: 'PLAY_ACTION',
        buttonTitle: '▶️ Reproducir',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'STOP_ACTION',
        buttonTitle: '⏹️ Detener',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

  } catch (error) {
    console.error('❌ Error configurando categorías:', error);
  }
};

// Inicialización completa del sistema de media
export const initializeMediaSession = async () => {
  
  try {
    await setupNotificationChannels();
    await setupMediaControlCategories();
    
  } catch (error) {
    console.error('❌ Error inicializando sistema de media:', error);
  }
}; 

// Función para limpiar todas las notificaciones de media
export const clearAllMediaNotifications = async () => {
  try {
    // Cancelar todas las notificaciones programadas relacionadas con media
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Descartar todas las notificaciones presentadas relacionadas con media
    const presentedNotifications = await Notifications.getPresentedNotificationsAsync();
    
    for (const notification of presentedNotifications) {
      const notificationType = notification.request.content.data?.type;
      if (typeof notificationType === 'string' && notificationType.includes('media')) {
        await Notifications.dismissNotificationAsync(notification.request.identifier);
      }
    }
    
    console.log('✅ Notificaciones de media limpiadas');
  } catch (error) {
    console.error('❌ Error limpiando notificaciones de media:', error);
  }
};

// Función para verificar si hay notificaciones de media activas
export const hasActiveMediaNotifications = async (): Promise<boolean> => {
  try {
    const presentedNotifications = await Notifications.getPresentedNotificationsAsync();
    
    return presentedNotifications.some(notification => {
      const notificationType = notification.request.content.data?.type;
      return typeof notificationType === 'string' && notificationType.includes('media');
    });
  } catch (error) {
    console.error('❌ Error verificando notificaciones activas:', error);
    return false;
  }
}; 