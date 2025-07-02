import { STREAMING_URLS } from '@/config/constants';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { useEffect, useState } from 'react';

export const useNativeAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Configurar audio con configuraciones COMPLETAS para controles nativos
  useEffect(() => {
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        // ✅ Configuraciones para background audio
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        
        // ✅ Configuraciones de interrupción (CRÍTICAS para controles nativos)
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: true,
        
        // ✅ NUEVA: Activar controles nativos específicamente
        allowsRecordingIOS: false,
      });
    };

    setupAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playAudio = async () => {
    try {
      setIsLoading(true);
      
      // Limpiar audio anterior
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Crear nuevo audio con configuraciones específicas para controles nativos
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: STREAMING_URLS.radioStream },
        {
          shouldPlay: true,
          volume: 1.0,
          rate: 1.0,
          shouldCorrectPitch: true,
          // ✅ CRÍTICO: Configuraciones para controles nativos
          progressUpdateIntervalMillis: 1000,
          positionMillis: 0,
        }
      );

      // Los metadatos se configuran automáticamente con las configuraciones de audio session

      setSound(newSound);
      setIsPlaying(true);
      setIsLoading(false);

      // Escuchar cambios de estado
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          
          if ('didJustFinish' in status && status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      });

    } catch (error) {
      console.error('Error reproduciendo:', error);
      setIsLoading(false);
    }
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  return {
    isPlaying,
    isLoading,
    playAudio,
    pauseAudio,
    togglePlayback,
  };
}; 