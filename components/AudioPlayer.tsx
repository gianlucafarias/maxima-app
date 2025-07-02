import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface AudioPlayerProps {
  isPlaying: boolean;
  isLoading: boolean;
  onTogglePlayback: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  isPlaying,
  isLoading,
  onTogglePlayback
}) => {
  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.playerCircle}
    >
      <View style={styles.innerCircle}>
        <LinearGradient
          colors={ ['#6c5ce7', '#a29bfe']}
          style={styles.visualizer}
        >
          <TouchableOpacity
            style={styles.playButton}
            onPress={onTogglePlayback}
            disabled={isLoading}
          >
            {isLoading ? (
              <Ionicons name="hourglass" size={60} color="white" />
            ) : (
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={60} 
                color="white" 
                style={!isPlaying && { marginLeft: 8 }}
              />
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
});

export default AudioPlayer; 