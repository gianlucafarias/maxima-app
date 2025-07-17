import { useEffect, useState } from 'react';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
  usePlaybackState,
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
  
  const playbackState = usePlaybackState();

  // Track events simplificado - solo eventos esenciales
  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
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
  });

  // Initialize player simplificado
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

        // Configurar opciones básicas
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
          progressUpdateEventInterval: 2,
        });

        console.log('✅ TrackPlayer inicializado correctamente');
        setIsPlayerReady(true);

      } catch (error) {
        console.error('❌ Error inicializando TrackPlayer:', error);
        setIsPlayerReady(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializePlayer();

    // Cleanup simple
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

  // Toggle play/pause simplificado
  const togglePlayback = async () => {
    if (!isPlayerReady) {
      console.log('❌ Player no está listo para togglePlayback');
      return;
    }
    
    try {
      const actualState = await TrackPlayer.getPlaybackState();
      const queue = await TrackPlayer.getQueue();
      
      console.log('🎵 togglePlayback - Estado actual:', actualState.state, 'Cola:', queue.length);
      
      // Si no hay tracks en la cola, intentar re-agregar
      if (queue.length === 0 && currentTrack) {
        console.log('🔄 Cola vacía, re-agregando track...');
        await addRadioStream(currentTrack);
      }
      
      if (actualState.state === State.Playing) {
        console.log('⏸️ Pausando');
        await TrackPlayer.stop();
      } else {
        console.log('▶️ Reproduciendo');
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
    addRadioStream,
    stopAndReset,
    togglePlayback,
    isPlaying: playbackState?.state === State.Playing,
    isPaused: playbackState?.state === State.Paused,
    isStopped: playbackState?.state === State.Stopped,
  };
}; 