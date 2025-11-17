import { useEffect } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import TrackPlayer, { Event, useTrackPlayerEvents } from 'react-native-track-player';

/**
 * Hook para manejar eventos de notificaciones de TrackPlayer
 * Maneja clicks en notificaciones y controles remotos (incluye TV)
 * sin interferir con expo-router
 */
export const useTrackPlayerNotifications = () => {
  
  // Listener para eventos específicos de TrackPlayer
  // Incluye eventos de controles remotos de TV
  useTrackPlayerEvents([
    Event.RemotePlay, 
    Event.RemotePause, 
    Event.RemoteStop,
    Event.RemoteNext,
    Event.RemotePrevious,
    Event.RemoteSeek,
    Event.RemoteDuck,
  ], async (event) => {
    const eventSource = Platform.isTV ? '📺 TV Remote' : '🎵 Notificación';
    console.log(`${eventSource} - Evento de TrackPlayer:`, event.type);
    
    try {
      switch (event.type) {
        case Event.RemotePlay:
          console.log(`▶️ Play desde ${eventSource}`);
          await TrackPlayer.play();
          break;
          
        case Event.RemotePause:
          console.log(`⏸️ Pause desde ${eventSource}`);
          await TrackPlayer.pause();
          break;
          
        case Event.RemoteStop:
          console.log(`⏹️ Stop desde ${eventSource}`);
          await TrackPlayer.stop();
          break;
          
        case Event.RemoteNext:
          console.log(`⏭️ Next desde ${eventSource}`);
          // En una radio en vivo, "next" podría no hacer nada
          // o reiniciar el stream
          break;
          
        case Event.RemotePrevious:
          console.log(`⏮️ Previous desde ${eventSource}`);
          // Similar a "next" en radio en vivo
          break;
          
        case Event.RemoteSeek:
          console.log(`⏩ Seek desde ${eventSource}`);
          // En streaming en vivo, normalmente no se permite seek
          break;
          
        case Event.RemoteDuck:
          console.log(`🔉 Duck (reducir volumen) desde ${eventSource}`);
          // Manejar audio ducking (reducir volumen temporalmente)
          // TrackPlayer ya lo maneja automáticamente
          break;
      }
    } catch (error) {
      console.error('❌ Error manejando evento remoto:', error);
    }
  });

  useEffect(() => {
    let linkingSubscription: any;
    
    const handleDeepLink = (url: string) => {
      console.log('🔗 Deep link interceptado por hook:', url);
      
      // Solo manejar links de TrackPlayer aquí para logging
      if (url.includes('trackplayer://')) {
        console.log('🎵 Deep link de TrackPlayer manejado por +native-intent.tsx');
        // El manejo real se hace en +native-intent.tsx
        // Aquí solo registramos el evento para debugging
      }
    };

    const setupLinkingListener = () => {
      // Listener para URLs mientras la app está activa
      linkingSubscription = Linking.addEventListener('url', (event) => {
        handleDeepLink(event.url);
      });

      // Verificar si la app se abrió con una URL inicial
      Linking.getInitialURL().then((url) => {
        if (url) {
          handleDeepLink(url);
        }
      });
    };

    const handleAppStateChange = (nextAppState: any) => {
      if (nextAppState === 'active') {
        console.log('📱 App volvió a primer plano');
        // La app volvió a estar activa, posiblemente desde una notificación
        // No necesitamos hacer nada especial aquí ya que TrackPlayer 
        // maneja su estado automáticamente
      }
    };

    // Configurar listeners
    setupLinkingListener();
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup
    return () => {
      linkingSubscription?.remove();
      appStateSubscription?.remove();
    };
  }, []);

  return {
    // Este hook no retorna nada específico, solo maneja eventos
    // Los componentes pueden usar useTrackPlayer() para el estado de reproducción
  };
}; 