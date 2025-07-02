import { STREAMING_URLS } from '@/config/constants';
import { Audio, AVPlaybackSource, AVPlaybackStatus } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

interface MediaMetadata {
  title: string;
  artist: string;
  album: string;
  artwork?: string;
}

export const useImprovedAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [currentTrack, setCurrentTrack] = useState<MediaMetadata>({
    title: 'Máxima FM',
    artist: '95.5 FM - En Vivo',
    album: 'Radio en Vivo',
  });

  useEffect(() => {
    initializeAudio();
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription?.remove();
      cleanup();
    };
  }, []);

  const initializeAudio = async () => {
    try {
      console.log('🎵 Inicializando audio mejorado...');
      
      // Configurar canales de notificación de Android
      if (Platform.OS === 'android') {
        await setupAndroidChannels();
      }
      
      // Configurar permisos
      await requestPermissions();
      
      // Configurar sesión de audio optimizada
      await setupOptimizedAudioSession();
      
      // Configurar manejadores de notificaciones
      setupNotificationHandlers();
      
      console.log('✅ Audio mejorado inicializado');
    } catch (error) {
      console.error('❌ Error inicializando audio:', error);
    }
  };

  const setupAndroidChannels = async () => {
    try {
      // Canal para controles de media con alta prioridad
      await Notifications.setNotificationChannelAsync('media-playback', {
        name: 'Reproductor de Audio',
        description: 'Controles de reproducción de Máxima FM',
        importance: Notifications.AndroidImportance.HIGH,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      console.log('✅ Canales de Android configurados');
    } catch (error) {
      console.error('❌ Error configurando canales:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: false,
          allowSound: false,
        },
        android: {
          allowAlert: true,
          allowBadge: false,
          allowSound: false,
        },
      });

      return status === 'granted';
    } catch (error) {
      console.error('❌ Error solicitando permisos:', error);
      return false;
    }
  };

  const setupOptimizedAudioSession = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        allowsRecordingIOS: false,
      });

      console.log('✅ Sesión de audio optimizada');
    } catch (error) {
      console.error('❌ Error configurando sesión:', error);
    }
  };

  const setupNotificationHandlers = () => {
    // Configurar categorías de notificación mejoradas
    setupNotificationCategories();

    // Handler para respuestas de notificación
    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    // Configurar cómo se muestran las notificaciones
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: true,
      }),
    });

    return () => subscription.remove();
  };

  const setupNotificationCategories = async () => {
    try {
      // Categoría para reproduciendo - con mejor estilo
      await Notifications.setNotificationCategoryAsync('MEDIA_PLAYING_ENHANCED', [
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

      // Categoría para pausado
      await Notifications.setNotificationCategoryAsync('MEDIA_PAUSED_ENHANCED', [
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

      console.log('✅ Categorías de notificación configuradas');
    } catch (error) {
      console.error('❌ Error configurando categorías:', error);
    }
  };

  const handleNotificationResponse = (response: any) => {
    const action = response.actionIdentifier;
    
    console.log('🎵 Acción recibida:', action);
    
    switch (action) {
      case 'PLAY_ACTION':
        playAudio();
        break;
      case 'PAUSE_ACTION':
        pauseAudio();
        break;
      case 'STOP_ACTION':
        stopAudio();
        break;
      default:
        // Tap en la notificación sin botón específico
        togglePlayback();
    }
  };

  const handleAppStateChange = (nextAppState: any) => {
    console.log('📱 App state:', appState, '->', nextAppState);
    
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App vuelve a primer plano
      if (isPlaying && sound) {
        verifyPlaybackState();
      }
    } else if (appState === 'active' && nextAppState.match(/inactive|background/)) {
      // App va a background - mostrar controles mejorados
      if (isPlaying) {
        showEnhancedMediaControls(true);
      }
    }
    setAppState(nextAppState);
  };

  const verifyPlaybackState = async () => {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && !status.isPlaying && isPlaying) {
          console.log('🔄 Reactivando reproducción...');
          await sound.playAsync();
        }
      }
    } catch (error) {
      console.error('❌ Error verificando estado:', error);
    }
  };

  const showEnhancedMediaControls = async (playing: boolean) => {
    try {
      const notification = {
        title: `${playing ? '🔴' : '⏸️'} ${currentTrack.title}`,
        body: `${currentTrack.artist} • ${currentTrack.album}`,
        data: {
          type: 'media_control_enhanced',
          isPlaying: playing,
          timestamp: Date.now(),
        },
        sticky: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' && {
          channelId: 'media-playback',
          color: '#FF6B6B',
        }),
        ...(Platform.OS === 'ios' && {
          subtitle: currentTrack.artist,
          badge: 0,
        }),
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          ...notification,
          categoryIdentifier: playing ? 'MEDIA_PLAYING_ENHANCED' : 'MEDIA_PAUSED_ENHANCED',
        },
        trigger: null,
        identifier: 'ENHANCED_MEDIA_CONTROLS',
      });

      console.log('✅ Controles mejorados mostrados');
    } catch (error) {
      console.error('❌ Error mostrando controles:', error);
    }
  };

  const playAudio = async () => {
    try {
      setIsLoading(true);
      console.log('▶️ Iniciando reproducción mejorada...');

      // Limpiar audio previo
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Crear nuevo objeto de audio con configuración optimizada
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: STREAMING_URLS.radioStream } as AVPlaybackSource,
        {
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
          rate: 1.0,
          shouldCorrectPitch: true,
          progressUpdateIntervalMillis: 2000, // Menos frecuente para mejor rendimiento
          positionMillis: 0,
        },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);
      setIsLoading(false);

      // Mostrar controles mejorados
      await showEnhancedMediaControls(true);

      console.log('✅ Reproducción iniciada con controles mejorados');
    } catch (error) {
      console.error('❌ Error reproduciendo:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const pauseAudio = async () => {
    try {
      console.log('⏸️ Pausando reproducción...');
      
      if (sound) {
        await sound.pauseAsync();
        await showEnhancedMediaControls(false);
      }
      
      setIsPlaying(false);
      console.log('✅ Reproducción pausada');
    } catch (error) {
      console.error('❌ Error pausando:', error);
    }
  };

  const stopAudio = async () => {
    try {
      console.log('⏹️ Deteniendo reproducción...');
      
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      
      setIsPlaying(false);
      await clearMediaControls();
      
      console.log('✅ Reproducción detenida');
    } catch (error) {
      console.error('❌ Error deteniendo:', error);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      const playing = status.isPlaying;
      
      // Solo actualizar si el estado cambió
      if (playing !== isPlaying) {
        setIsPlaying(playing);
        setIsLoading(status.isBuffering);
        
        // Actualizar controles si la app está en background
        if (appState !== 'active') {
          showEnhancedMediaControls(playing);
        }
      }
    } else if (status.error) {
      console.error('❌ Error de reproducción:', status.error);
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const clearMediaControls = async () => {
    try {
      await Notifications.dismissNotificationAsync('ENHANCED_MEDIA_CONTROLS');
      console.log('✅ Controles limpiados');
    } catch (error) {
      console.error('❌ Error limpiando controles:', error);
    }
  };

  const cleanup = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      await clearMediaControls();
      console.log('✅ Limpieza completada');
    } catch (error) {
      console.error('❌ Error en limpieza:', error);
    }
  };

  const updateTrackInfo = (info: Partial<MediaMetadata>) => {
    setCurrentTrack(prev => ({ ...prev, ...info }));
    
    // Si está reproduciendo, actualizar controles
    if (isPlaying && appState !== 'active') {
      showEnhancedMediaControls(true);
    }
  };

  return {
    // Estados
    sound,
    isPlaying,
    isLoading,
    currentTrack,
    
    // Funciones principales
    playAudio,
    pauseAudio,
    stopAudio,
    togglePlayback,
    updateTrackInfo,
    
    // Utilidades
    cleanup,
    showEnhancedMediaControls,
    clearMediaControls,
  };
}; 