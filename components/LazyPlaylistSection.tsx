import { LazyPlaylistSectionProps } from '@/types/youtube';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LazyPlaylistSection: React.FC<LazyPlaylistSectionProps> = ({
  playlist,
  videos,
  isLoaded,
  isLoading,
  onLoad,
  onVideoPress,
  formatDate,
  scrollY
}) => {
  const sectionRef = useRef<View>(null);
  const [sectionY, setSectionY] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (!hasTriggered && !isLoaded && !isLoading && sectionY > 0) {
      const screenHeight = Dimensions.get('window').height;
      const sectionBottom = sectionY + 200; // Altura estimada de la sección
      const triggerPoint = sectionY - 200; // Trigger más temprano
      
      // Debug detallado
      
      // Si la sección está visible o cerca de serlo
      if (scrollY + screenHeight >= triggerPoint && scrollY <= sectionBottom + 100) {
        setHasTriggered(true);
        
        // Agregar un pequeño delay para debug
        setTimeout(() => {
          onLoad();
        }, 300);
      }
    }
  }, [scrollY, sectionY, hasTriggered, isLoaded, isLoading, onLoad, playlist.name]);

  // NOTA: Carga automática deshabilitada para conservar cuota de API

  const handleLayout = (event: any) => {
    const { y } = event.nativeEvent.layout;
    setSectionY(y);
    
    // NOTA: Carga automática por posición deshabilitada para conservar cuota de API
    // Solo se carga cuando el usuario hace scroll manual
  };

  return (
    <View 
      ref={sectionRef}
      style={styles.programSection}
      onLayout={handleLayout}
    >
      {/* Header del programa */}
      <View style={styles.programHeader}>
        <View style={[styles.programIcon, { backgroundColor: playlist.color }]}>
          <Ionicons name={playlist.icon as any} size={24} color="white" />
        </View>
        <View style={styles.programInfo}>
          <Text style={styles.programName}>{playlist.name}</Text>
          <Text style={styles.programSchedule}>{playlist.schedule}</Text>
        </View>
      </View>

      {/* Videos del programa */}
      <View style={styles.programVideos}>
        {isLoading ? (
          <View style={styles.playlistLoadingContainer}>
            <Ionicons name="hourglass" size={20} color="#a29bfe" />
            <Text style={styles.playlistLoadingText}>Cargando {playlist.name}...</Text>
          </View>
        ) : videos.length > 0 ? (
          <View style={styles.videosGrid}>
            {videos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={styles.videoCardVertical}
                onPress={() => onVideoPress(video.id)}
              >
                <View style={styles.videoThumbnailContainer}>
                  <Image 
                    source={{ uri: video.thumbnail }} 
                    style={styles.videoThumbnailLarge}
                    resizeMode="cover"
                  />
                  <View style={styles.playOverlay}>
                    <Ionicons name="play" size={32} color="white" />
                  </View>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{video.duration}</Text>
                  </View>
                </View>
                <View style={styles.videoInfoVertical}>
                  <Text style={styles.videoTitleVertical} numberOfLines={3}>
                    {video.title}
                  </Text>
                  <Text style={styles.videoDate}>
                    {formatDate(video.publishedAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : !isLoaded ? (
          <View style={styles.playlistPlaceholder}>
            <Ionicons name="download-outline" size={24} color="#666" />
            <Text style={styles.placeholderText}>Haz scroll hacia abajo para cargar videos</Text>
          </View>
        ) : (
          <View style={styles.noVideosContainer}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.noVideosText}>Sin videos recientes</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  programSection: {
    backgroundColor: 'rgba(162, 155, 254, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  programIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 3,
  },
  programSchedule: {
    fontSize: 14,
    color: '#a29bfe',
  },
  programVideos: {
    gap: 10,
  },
  videosGrid: {
    gap: 12,
  },
  videoCardVertical: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  videoThumbnailContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  videoThumbnailLarge: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  videoInfoVertical: {
    paddingTop: 0,
  },
  videoTitleVertical: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    lineHeight: 22,
  },
  videoDate: {
    fontSize: 12,
    color: '#a29bfe',
    marginBottom: 3,
  },
  playlistLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  playlistLoadingText: {
    fontSize: 14,
    color: '#a29bfe',
    marginLeft: 10,
  },
  playlistPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    opacity: 0.5,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  noVideosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    opacity: 0.5,
  },
  noVideosText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});

export default LazyPlaylistSection; 