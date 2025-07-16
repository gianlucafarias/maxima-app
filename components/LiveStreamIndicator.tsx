import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LiveStreamData {
  videoId: string;
  title: string;
  viewerCount?: number;
  isLive: boolean;
}

interface LiveStreamIndicatorProps {
  liveStream: LiveStreamData | null;
  mode: 'audio' | 'video';
  selectedVideoId?: string | null;
  onPress?: () => void;
}

export const LiveStreamIndicator: React.FC<LiveStreamIndicatorProps> = ({
  liveStream,
  mode,
  selectedVideoId,
  onPress
}) => {
  if (!liveStream || !liveStream.isLive) {
    return null;
  }

  // Verificar si estamos mostrando el livestream activo en modo video
  const isCurrentlyLive = mode === 'video' && selectedVideoId === liveStream.videoId;

  if (mode === 'audio') {
    // Modo audio: botón interactivo para ir al video
    return (
      <TouchableOpacity style={styles.audioContainer} onPress={onPress}>
        <View style={styles.audioContent}>
          <Text style={styles.audioTitle}>
            🔴 EN VIVO
          </Text>
          <Text style={styles.liveTitle} numberOfLines={1}>
            {liveStream.title}
          </Text>
          {liveStream.viewerCount && liveStream.viewerCount > 0 && (
            <Text style={styles.viewerCount}>
              👁️ {liveStream.viewerCount.toLocaleString()} viendo
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  } else {
    // Modo video: usar el mismo estilo de card que en audio
    if (isCurrentlyLive) {
      return (
        <View style={styles.audioContainer}>
          <View style={styles.audioContent}>
            <Text style={styles.audioTitle}>
              🔴 EN VIVO
            </Text>
            <Text style={styles.liveTitle} numberOfLines={1}>
              {liveStream.title}
            </Text>
            {liveStream.viewerCount && liveStream.viewerCount > 0 && (
              <Text style={styles.viewerCount}>
                👁️ {liveStream.viewerCount.toLocaleString()} viendo
              </Text>
            )}
          </View>
        </View>
      );
    } else {
      // Solo para YouTube/Twitch sin live
      return (
        <View style={styles.videoContainer}>
          <Text style={styles.videoTitle}>
            {selectedVideoId ? '📺 YouTube' : '📺 Twitch Live'}
          </Text>
        </View>
      );
    }
  }
};

const styles = StyleSheet.create({
  // Estilos para modo audio
  audioContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginHorizontal: 20,
  },
  audioContent: {
    alignItems: 'center',
  },
  audioTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  
  // Estilos para modo video
  videoContainer: {
    marginTop: 4,
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 12,
    color: '#a29bfe',
    marginTop: 8,
    opacity: 0.8,
  },
  videoViewerCount: {
    fontSize: 11,
    color: '#00ff88',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Estilos compartidos
  liveTitle: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  viewerCount: {
    fontSize: 10,
    color: 'white',
    opacity: 0.8,
  },
}); 