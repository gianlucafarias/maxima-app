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
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== null && event.nextTrack !== undefined) {
      try {
        const track = await TrackPlayer.getTrack(event.nextTrack);
        if (track) {
          setCurrentTrack(track as RadioTrack);
        }
      } catch (error) {
        console.error('❌ Error obteniendo track:', error);
        // No establecer currentTrack si hay error
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

      try {
        // Verificar si TrackPlayer ya está configurado
        let isAlreadySetup = false;
        try {
          await TrackPlayer.getPlaybackState();
          isAlreadySetup = true;
        } catch (error) {
        }

        // Solo configurar si no está ya configurado
        if (!isAlreadySetup) {
          await TrackPlayer.setupPlayer();
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
      return;
    }
    
    try {
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
    } catch (error) {
      console.error('❌ Error agregando stream:', error);
    }
  };

  // Función simple para parar y resetear
  const stopAndReset = async () => {
    try {  
      if (isPlayerReady) {
        await TrackPlayer.pause();
        await TrackPlayer.reset();
        setCurrentTrack(null);
      }
    } catch (error) {
      console.error('❌ Error en stopAndReset:', error);
    }
  };

  // Toggle play/pause
  const togglePlayback = async () => {
    if (!isPlayerReady) {
      return;
    }
    
    try {
      const state = playbackState?.state;
      
      if (state === State.Playing) {
        await TrackPlayer.pause();
      } else if (state === State.Paused || state === State.Stopped || state === State.Ready) {
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
    togglePlayback,
    isPlaying: playbackState?.state === State.Playing,
    isPaused: playbackState?.state === State.Paused,
    isStopped: playbackState?.state === State.Stopped,
  };
}; 