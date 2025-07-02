import { STREAMING_URLS } from '@/config/constants';
import { DEFAULT_MEDIA_METADATA, MediaMetadata } from '@/config/mediaSession';
import { Audio, AVPlaybackSource, AVPlaybackStatus } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

export const useAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [currentTrackInfo, setCurrentTrackInfo] = useState<MediaMetadata>(DEFAULT_MEDIA_METADATA);

  // Función para solicitar permisos de notificaciones
  const requestNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      if (status === 'granted') {
        console.log('✅ Permisos de notificaciones concedidos');
      } else {
        console.warn('⚠️ Permisos de notificaciones denegados');
      }

      return status === 'granted';
    } catch (error) {
      console.error('❌ Error solicitando permisos de notificaciones:', error);
      return false;
    }
  };

  useEffect(() => {
    // Inicializar sistema completo de media
    const initializeAudio = async () => {
      // Configurar audio para background
      await setupAudioSession();
      
      // Inicializar sistema de media session (canales, categorías, etc.)
      // await initializeMediaSession(); // TODO: Verificar import
      
      // Solicitar permisos de notificaciones
      await requestNotificationPermissions();
      
      // Configurar manejadores de notificaciones
      setupNotificationHandlers();
    };

    initializeAudio();

    // Listener para cambios de estado de la app
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      // Limpiar audio y notificación al desmontar
      cleanup();
    };
  }, []);

  // Configurar manejadores de notificaciones para media controls
  const setupNotificationHandlers = () => {
    // Configurar cómo se muestran las notificaciones cuando la app está en foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false, // No mostrar alert cuando está en foreground
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: true, // Permitir en la lista de notificaciones
      }),
    });

    // Listener para cuando el usuario toca los botones de la notificación
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const action = response.actionIdentifier;
      
      console.log('🎵 Acción de notificación recibida:', action);
      
      switch (action) {
        case 'PLAY_ACTION':
          playMedia();
          break;
        case 'PAUSE_ACTION':
          stopMedia();
          break;
        case 'STOP_ACTION':
          stopMedia();
          clearMediaNotification();
          break;
        default:
          // Si toca la notificación (sin botón específico), alternar reproducción
          togglePlayback();
      }
    });

    return () => subscription.remove();
  };

  // Configurar sesión de audio con expo-av para controles nativos
  const setupAudioSession = async () => {
    try {
      console.log('🔧 Configurando sesión de audio...');
      
      // Configurar el modo de audio con expo-av
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
      });

      console.log('✅ Sesión de audio configurada correctamente');
      
    } catch (error) {
      console.error('❌ Error configurando sesión de audio:', error);
    }
  };

  const handleAppStateChange = (nextAppState: any) => {
    console.log('📱 Cambio de estado de app:', appState, '->', nextAppState);
    
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App vuelve a primer plano      
      console.log('📱 App vuelve a primer plano');
      // Reconfigurar audio session por si se perdió
      setupAudioSession();
      
      // Si estaba reproduciendo audio, verificar que siga funcionando
      if (isPlaying && sound) {
        sound.getStatusAsync().then((status: AVPlaybackStatus) => {
          if (status.isLoaded && !status.isPlaying && isPlaying) {
            console.log('🔄 Reiniciando reproducción...');
            sound.playAsync();
          }
        }).catch(error => {
          console.error('❌ Error verificando estado del audio:', error);
        });
      }
    } else if (appState === 'active' && nextAppState.match(/inactive|background/)) {
      // App va a segundo plano
      console.log('📱 App va a segundo plano');
      
      if (isPlaying) {
        // Mostrar notificación de media controls cuando va a background
        updateMediaNotification(true);
        setupNowPlayingInfo(true);
      }
    }
    setAppState(nextAppState);
  };

  // Configurar información de Now Playing (aparece en controles nativos)
  const setupNowPlayingInfo = async (playing: boolean) => {
    try {
      if (Platform.OS === 'ios') {
        // En iOS, usar el sistema de Now Playing
        const nowPlayingInfo = {
          'MPMediaItemPropertyTitle': currentTrackInfo.title,
          'MPMediaItemPropertyArtist': currentTrackInfo.artist,
          'MPMediaItemPropertyAlbumTitle': currentTrackInfo.album,
          'MPNowPlayingInfoPropertyIsLiveStream': true,
          'MPNowPlayingInfoPropertyPlaybackRate': playing ? 1.0 : 0.0,
          'MPMediaItemPropertyPlaybackDuration': 0,
          'MPNowPlayingInfoPropertyElapsedPlaybackTime': 0,
        };

        // Configurar Now Playing Info usando expo-av
        // Nota: Esta funcionalidad puede requerir configuración nativa adicional
        console.log('📱 Configurando Now Playing Info para iOS:', nowPlayingInfo);
      }

      console.log('✅ Información de Now Playing configurada');
    } catch (error) {
      console.error('❌ Error configurando Now Playing Info:', error);
    }
  };

  // Crear o actualizar la notificación de media controls
  const updateMediaNotification = async (playing: boolean) => {
    try {      
      const notificationContent = {
        title: currentTrackInfo.title,
        body: playing ? 
          `🔴 ${currentTrackInfo.artist} - En Vivo` : 
          `⏸️ ${currentTrackInfo.artist} - Pausado`,
        data: { 
          type: 'media_control',
          isPlaying: playing,
          timestamp: Date.now()
        },
        sticky: true, // Hacer la notificación persistente
        priority: Notifications.AndroidNotificationPriority.LOW, // Prioridad baja para no ser intrusiva
        sound: false, // No reproducir sonido de notificación
        // En Android, configurar como Media Style notification
        ...(Platform.OS === 'android' && {
          channelId: 'media-controls',
          color: '#FF6B6B', // Color de acento de Máxima FM
        })
      };

      // Usar categoría dinámica basada en el estado de reproducción
      const categoryIdentifier = playing ? 'MEDIA_PLAYING' : 'MEDIA_PAUSED';

      // Programar la notificación
      await Notifications.scheduleNotificationAsync({
        content: {
          ...notificationContent,
          categoryIdentifier,
        },
        trigger: null, // Mostrar inmediatamente
        identifier: 'MEDIA_PLAYER_NOTIFICATION', // ID único para actualizar la misma notificación
      });

      console.log('✅ Notificación de media controls actualizada:', { playing, category: categoryIdentifier });
    } catch (error) {
      console.error('❌ Error actualizando notificación de media controls:', error);
    }
  };

  // Limpiar la notificación de media controls
  const clearMediaNotification = async () => {
    try {
      await Notifications.dismissNotificationAsync('MEDIA_PLAYER_NOTIFICATION');
      console.log('✅ Notificación de media controls limpiada');
    } catch (error) {
      console.error('❌ Error limpiando notificación:', error);
    }
  };

  const playMedia = async () => {
    try {
      setIsLoading(true);
      console.log('▶️ Iniciando reproducción...');
      
      // Asegurar que la sesión de audio esté configurada correctamente
      await setupAudioSession();

      // Si ya hay un objeto sound, limpiarlo primero
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Crear nuevo objeto de audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: STREAMING_URLS.radioStream } as AVPlaybackSource,
        {
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
          rate: 1.0,
          shouldCorrectPitch: true,
          // Configuración específica para streaming
          progressUpdateIntervalMillis: 1000,
          positionMillis: 0,
        },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);
      setIsLoading(false);

      console.log('✅ Reproducción iniciada');

      // Configurar información de Now Playing para controles nativos
      await setupNowPlayingInfo(true);

      // Crear/actualizar notificación de media controls
      await updateMediaNotification(true);
      
    } catch (error) {
      console.error('❌ Error playing media:', error);
      setIsLoading(false);
      setIsPlaying(false);
      
      // Reintentar configuración de audio en caso de error
      try {
        await setupAudioSession();
      } catch (retryError) {
        console.error('❌ Error en reintento:', retryError);
      }
    }
  };

  // Callback para actualizaciones de estado de reproducción
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setIsLoading(status.isBuffering);
      
      // Actualizar Now Playing Info cuando cambie el estado
      if (status.isPlaying !== isPlaying) {
        setupNowPlayingInfo(status.isPlaying);
      }
    } else if (status.error) {
      console.error('❌ Error en reproducción:', status.error);
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const stopMedia = async () => {
    try {
      console.log('⏸️ Deteniendo reproducción...');
      
      if (sound) {
        await sound.pauseAsync();
        
        // Actualizar Now Playing Info para mostrar estado pausado
        await setupNowPlayingInfo(false);
        
        // Actualizar notificación para mostrar estado pausado
        await updateMediaNotification(false);
      }
      
      setIsPlaying(false);
      console.log('✅ Reproducción detenida');
    } catch (error) {
      console.error('❌ Error stopping media:', error);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopMedia();
    } else {
      playMedia();
    }
  };

  const cleanup = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      await clearMediaNotification();
      console.log('✅ Limpieza de audio completada');
    } catch (error) {
      console.error('❌ Error en limpieza:', error);
    }
  };

  // Función para actualizar información de la pista (útil para futuras funciones)
  const updateTrackInfo = (info: Partial<typeof currentTrackInfo>) => {
    setCurrentTrackInfo(prev => ({ ...prev, ...info }));
  };

  return {
    sound,
    isPlaying,
    isLoading,
    appState,
    currentTrackInfo,
    setIsPlaying,
    setupAudioSession,
    playMedia,
    stopMedia,
    togglePlayback,
    updateMediaNotification,
    clearMediaNotification,
    updateTrackInfo,
    cleanup
  };
}; 