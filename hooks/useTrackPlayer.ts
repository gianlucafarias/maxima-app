import { useEffect, useState } from 'react';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';

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
  const progress = useProgress();

  // Track events
  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== null) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      if (track) {
        setCurrentTrack(track as RadioTrack);
      }
    }
  });

  // Initialize player
  useEffect(() => {
    const initializePlayer = async () => {
      if (isInitializing || isPlayerReady) {
        return;
      }

      setIsInitializing(true);
      console.log('🎵 Inicializando TrackPlayer...');

      try {
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
          console.log('✅ TrackPlayer.setupPlayer() completado');
        }

        // Configurar opciones
        await TrackPlayer.updateOptions({
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
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

        console.log('✅ TrackPlayer opciones configuradas');
        setIsPlayerReady(true);
        console.log('✅ TrackPlayer listo para usar');

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
          console.log('Error pausing on cleanup:', e);
        });
      }
    };
  }, []);

  // Add radio stream
  const addRadioStream = async (track: RadioTrack) => {
    if (!isPlayerReady) {
      console.log('⚠️ Player no está listo para agregar stream');
      return;
    }
    
    try {
      console.log('🎵 Agregando stream:', track.title);
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: track.id,
        url: track.url,
        title: track.title,
        artist: track.artist,
        artwork: track.artwork,
        isLiveStream: true,
      });
      setCurrentTrack(track);
      console.log('✅ Stream agregado correctamente');
    } catch (error) {
      console.error('❌ Error agregando stream:', error);
    }
  };

  // Play
  const play = async () => {
    if (!isPlayerReady) {
      console.log('⚠️ Player no está listo para reproducir');
      return;
    }
    
    try {
      const queue = await TrackPlayer.getQueue();
      if (queue.length === 0) {
        console.log('⚠️ No hay tracks en la cola');
        return;
      }
      
      console.log('▶️ Iniciando reproducción');
      await TrackPlayer.play();
    } catch (error) {
      console.error('❌ Error reproduciendo:', error);
    }
  };

  // Pause
  const pause = async () => {
    if (!isPlayerReady) {
      console.log('⚠️ Player no está listo para pausar');
      return;
    }
    
    try {
      console.log('⏸️ Pausando reproducción');
      await TrackPlayer.pause();
    } catch (error) {
      console.error('❌ Error pausando:', error);
    }
  };

  // Stop
  const stop = async () => {
    if (!isPlayerReady) {
      console.log('⚠️ Player no está listo para detener');
      return;
    }
    
    try {
      console.log('⏹️ Deteniendo reproducción');
      await TrackPlayer.pause();
      await TrackPlayer.seekTo(0);
    } catch (error) {
      console.error('❌ Error deteniendo:', error);
    }
  };

  // Toggle play/pause
  const togglePlayback = async () => {
    if (!isPlayerReady) {
      console.log('⚠️ Player no está listo para toggle');
      return;
    }
    
    const currentState = playbackState?.state;
    console.log('🔄 Toggle playback, estado actual:', currentState);
    
    try {
      if (currentState === State.Playing) {
        await pause();
      } else {
        await play();
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
    play,
    pause,
    stop,
    togglePlayback,
    isPlaying: playbackState?.state === State.Playing,
    isPaused: playbackState?.state === State.Paused,
    isStopped: playbackState?.state === State.Stopped,
  };
}; 