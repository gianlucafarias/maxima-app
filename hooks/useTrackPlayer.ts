import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import { isTrackPlayerServiceRegistered } from '../config/trackPlayerSetup';

interface RadioTrack {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork: string;
  isLiveStream?: boolean;
}

export const useTrackPlayer = () => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<RadioTrack | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  
  const playbackState = usePlaybackState();
  const progress = useProgress();

  // Track events - escuchar múltiples eventos
  useTrackPlayerEvents([
    Event.PlaybackTrackChanged,
    Event.PlaybackState,
    Event.RemoteStop,
    Event.RemotePause,
    Event.RemotePlay
  ], async (event) => {
    console.log('🎵 TrackPlayer Event:', event.type);
    
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== null && event.nextTrack !== undefined) {
      try {
        const track = await TrackPlayer.getTrack(event.nextTrack);
        if (track) {
          setCurrentTrack(track as RadioTrack);
        }
      } catch (error) {
        console.error('❌ Error obteniendo track:', error);
      }
    }

    // Detectar cuando se detiene desde controles remotos
    if (event.type === Event.PlaybackState) {
      console.log('🔄 Cambio de estado:', event.state);
      if (event.state === State.Stopped) {
        console.log('⏹️ Audio detenido - verificando cola');
        // Verificar si la cola sigue intacta después de stop
        try {
          const queue = await TrackPlayer.getQueue();
          if (queue.length === 0) {
            console.log('❌ Cola vacía después de stop');
          } else {
            console.log('✅ Cola preservada después de stop');
          }
        } catch (error) {
          console.error('❌ Error verificando cola:', error);
        }
      }
    }

    // Log para eventos remotos
    if (event.type === Event.RemoteStop) {
      console.log('⏹️ RemoteStop detectado en hook');
    }
    if (event.type === Event.RemotePause) {
      console.log('⏸️ RemotePause detectado en hook');
    }
    if (event.type === Event.RemotePlay) {
      console.log('▶️ RemotePlay detectado en hook');
    }
  });

  // Listener para detectar cuando se descarta la notificación
  useEffect(() => {
    let notificationCheckInterval: ReturnType<typeof setInterval>;

    const checkNotificationStatus = async () => {
      try {
        if (playbackState?.state === State.Playing) {
          const presentedNotifications = await Notifications.getPresentedNotificationsAsync();
          const mediaNotifications = presentedNotifications.filter(n => {
            const notificationType = n.request.content.data?.type;
            const categoryId = n.request.content.categoryIdentifier;
            return (typeof notificationType === 'string' && notificationType.includes('media')) ||
                   (typeof categoryId === 'string' && categoryId.includes('MEDIA'));
          });
          
          const currentNotificationCount = mediaNotifications.length;
          
          // Si había notificaciones antes y ahora no hay, la notificación fue descartada
          if (lastNotificationCount > 0 && currentNotificationCount === 0 && playbackState?.state === State.Playing) {
            console.log('🔔 Notificación descartada - deteniendo audio');
            await cleanupCompletely();
          }
          
          setLastNotificationCount(currentNotificationCount);
        }
      } catch (error) {
        console.error('❌ Error verificando notificaciones:', error);
      }
    };

    // Solo ejecutar si está reproduciendo y la app está en background
    if (playbackState?.state === State.Playing && appState !== 'active') {
      notificationCheckInterval = setInterval(checkNotificationStatus, 2000);
    }

    return () => {
      if (notificationCheckInterval) {
        clearInterval(notificationCheckInterval);
      }
    };
  }, [playbackState?.state, appState, lastNotificationCount]);

  // Listener para cambios de estado de la app - detectar cuando se descarta notificación
  useEffect(() => {
    const handleAppStateChange = (nextAppState: any) => {
      // Si la app vuelve a primer plano y no está reproduciendo, puede ser que se descartó la notificación
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // Verificar si el audio debería estar sonando pero no está
        const checkNotificationStatus = async () => {
          try {
            const state = await TrackPlayer.getPlaybackState();
            if (state.state === State.Stopped && playbackState?.state === State.Playing) {
              // La notificación fue probablemente descartada
              console.log('🔔 Notificación posiblemente descartada - limpiando estado');
              await cleanupCompletely();
            }
          } catch (error) {
            console.log('❌ Error verificando estado de notificación:', error);
          }
        };
        
        checkNotificationStatus();
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription?.remove();
  }, [appState, playbackState?.state]);

  // Initialize player
  useEffect(() => {
    const initializePlayer = async () => {
      if (isInitializing || isPlayerReady) {
        return;
      }

      setIsInitializing(true);

      try {
        // Verificar que el servicio esté registrado
        if (!isTrackPlayerServiceRegistered()) {
          console.error('❌ Servicio TrackPlayer no está registrado');
          throw new Error('TrackPlayer service not registered');
        }

        console.log('🔧 Inicializando TrackPlayer...');
        
        // Verificar si TrackPlayer ya está configurado
        let isAlreadySetup = false;
        try {
          await TrackPlayer.getPlaybackState();
          isAlreadySetup = true;
          console.log('✅ TrackPlayer ya estaba configurado');
        } catch (error) {
          console.log('🔧 TrackPlayer necesita configuración inicial');
        }

        // Solo configurar si no está ya configurado
        if (!isAlreadySetup) {
          await TrackPlayer.setupPlayer();
          console.log('✅ TrackPlayer configurado');
        }

        // Configurar opciones
        console.log('🔧 Configurando opciones de TrackPlayer...');
        await TrackPlayer.updateOptions({
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          },
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
          ],
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
          ],
          progressUpdateEventInterval: 2,
        });

        console.log('✅ Opciones de TrackPlayer configuradas');
        setIsPlayerReady(true);

      } catch (error) {
        console.error('❌ Error inicializando TrackPlayer:', error);
        setIsPlayerReady(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializePlayer();

    // Cleanup
    return () => {
      if (isPlayerReady) {
        TrackPlayer.pause().catch((e) => {
          console.warn('Error pausing on cleanup:', e);
        });
      }
    };
  }, []);

  // Add radio stream
  const addRadioStream = async (track: RadioTrack) => {
    if (!isPlayerReady) {
      console.log('❌ Player no está listo para agregar stream');
      return;
    }

    try {
      // Verificar si ya hay tracks en la cola
      const queue = await TrackPlayer.getQueue();
      
      // Si ya existe un track con el mismo ID, no agregarlo de nuevo
      const existingTrack = queue.find(t => t.id === track.id);
      if (existingTrack) {
        console.log('✅ Track ya existe en la cola:', track.id);
        setCurrentTrack(track);
        return;
      }

      console.log('🎵 Agregando radio stream:', track.title);
      await TrackPlayer.add({
        id: track.id,
        url: track.url,
        title: track.title,
        artist: track.artist,
        artwork: track.artwork,
        isLiveStream: true,
      });
      setCurrentTrack(track);
      console.log('✅ Stream agregado exitosamente');
    } catch (error) {
      console.error('❌ Error agregando stream:', error);
    }
  };

  // Función para asegurar que hay un track en la cola
  const ensureTrackInQueue = async () => {
    try {
      const queue = await TrackPlayer.getQueue();
      if (queue.length === 0 && currentTrack) {
        console.log('🔄 Cola vacía, re-agregando track...');
        await addRadioStream(currentTrack);
      }
    } catch (error) {
      console.error('❌ Error verificando cola:', error);
    }
  };

  // Función simple para parar y resetear
  const stopAndReset = async () => {
    try {  
      if (isPlayerReady) {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
        setCurrentTrack(null);
      }
    } catch (error) {
      console.error('❌ Error en stopAndReset:', error);
    }
  };

  // Función para limpieza completa (cuando se cierra la app o se quita notificación)
  const cleanupCompletely = async () => {
    try {
      if (isPlayerReady) {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
        setCurrentTrack(null);
        setIsPlayerReady(false);
      }
    } catch (error) {
      console.error('❌ Error en limpieza completa:', error);
    }
  };

  // Toggle play/pause
  const togglePlayback = async () => {
    if (!isPlayerReady) {
      console.log('❌ Player no está listo para togglePlayback');
      return;
    }
    
    try {
      // Verificar el estado real del TrackPlayer, no solo el hook
      const actualState = await TrackPlayer.getPlaybackState();
      const queue = await TrackPlayer.getQueue();
      
      console.log('🎵 togglePlayback - Estado actual:', actualState.state, 'Cola:', queue.length);
      
      // Si no hay tracks en la cola, intentar re-agregar
      if (queue.length === 0) {
        console.log('🔄 Cola vacía, intentando re-agregar track...');
        await ensureTrackInQueue();
        
        // Verificar de nuevo después de intentar agregar
        const newQueue = await TrackPlayer.getQueue();
        if (newQueue.length === 0) {
          console.log('❌ No se pudo agregar track a la cola');
          return;
        }
      }
      
      if (actualState.state === State.Playing) {
        console.log('⏸️ Pausando desde togglePlayback');
        await TrackPlayer.stop();
      } else if (actualState.state === State.Paused || actualState.state === State.Stopped || actualState.state === State.Ready) {
        console.log('▶️ Reproduciendo desde togglePlayback');
        await TrackPlayer.play();
      } else {
        console.log('🔄 Estado desconocido, intentando reproducir');
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error('❌ Error en togglePlayback:', error);
    }
  };

  return {
    isPlayerReady,
    isInitializing,
    currentTrack,
    playbackState: playbackState?.state || State.None,
    progress,
    addRadioStream,
    stopAndReset,
    cleanupCompletely,
    ensureTrackInQueue,
    togglePlayback,
    isPlaying: playbackState?.state === State.Playing,
    isPaused: playbackState?.state === State.Paused,
    isStopped: playbackState?.state === State.Stopped,
  };
}; 