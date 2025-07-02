import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTrackPlayer } from '../hooks/useTrackPlayer';

const { width } = Dimensions.get('window');

interface TrackPlayerRadioProps {
  streamUrl: string;
  title?: string;
  artist?: string;
  artwork?: string;
}

export const TrackPlayerRadio: React.FC<TrackPlayerRadioProps> = ({
  streamUrl,
  title = 'Máxima FM 95.5',
  artist = 'La mejor música en vivo',
  artwork = require('../assets/images/maxima.svg'),
}) => {
  const {
    isPlayerReady,
    isInitializing,
    addRadioStream,
    togglePlayback,
    isPlaying,
    currentTrack,
  } = useTrackPlayer();

  // Agregar stream cuando el player esté listo
  useEffect(() => {
    if (isPlayerReady && streamUrl) {
      console.log('🎵 Player listo, agregando stream...');
      addRadioStream({
        id: 'maxima-fm-stream',
        url: streamUrl,
        title,
        artist,
        artwork,
      });
    }
  }, [isPlayerReady, streamUrl]);

  const handlePlayPause = () => {
    console.log('🎵 Button pressed, isPlayerReady:', isPlayerReady, 'isInitializing:', isInitializing);
    if (isPlayerReady && !isInitializing) {
      togglePlayback();
    }
  };

  // Estados de carga
  const showLoader = isInitializing || (!isPlayerReady && !isInitializing);
  const isDisabled = !isPlayerReady || isInitializing;

  // Determinar qué ícono mostrar
  const renderIcon = () => {
    if (showLoader) {
      return <ActivityIndicator size={60} color="white" />;
    }
    
    if (isPlaying) {
      return <Ionicons name="pause" size={60} color="white" />;
    }
    
    return (
      <Ionicons 
        name="play" 
        size={60} 
        color="white" 
        style={{ marginLeft: 8 }}
      />
    );
  };

  // Texto de estado
  const getStatusText = () => {
    if (isInitializing) return 'Iniciando...';
    if (!isPlayerReady) return 'Preparando...';
    if (!currentTrack) return 'Cargando stream...';
    if (isPlaying) return 'En vivo';
    return 'Listo';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.playerCircle}
      >
        <View style={styles.innerCircle}>
          <LinearGradient
            colors={['#6c5ce7', '#a29bfe']}
            style={styles.visualizer}
          >
            <TouchableOpacity
              style={[
                styles.playButton,
                isDisabled && styles.playButtonDisabled
              ]}
              onPress={handlePlayPause}
              disabled={isDisabled}
            >
              {renderIcon()}
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </LinearGradient>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  playerCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  innerCircle: {
    width: '85%',
    height: '85%',
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualizer: {
    width: '90%',
    height: '90%',
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  playButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  statusText: {
    color: '#a29bfe',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  trackTitle: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
}); 