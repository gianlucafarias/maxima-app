import { YouTubeVideo } from '@/hooks/useYouTubeRSS';
import { TVTouchable } from '@/components/TVTouchable';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

interface YouTubeSectionProps {
  videos: YouTubeVideo[];
  loading: boolean;
  lastUpdate: Date | null;
  onRefresh: () => void;
}

const YouTubeSection: React.FC<YouTubeSectionProps> = ({
  videos,
  loading,
  lastUpdate,
  onRefresh
}) => {

  // No mostrar la sección si no hay videos y no está cargando
  if (!loading && videos.length === 0) {
    return null;
  }

  const openVideo = async (url: string, title: string) => {
    try {
      
      // Verificar que la URL sea válida
      if (!url || !url.includes('youtube.com')) {
        console.error('❌ URL inválida:', url);
        Alert.alert('Error', 'El enlace del video no es válido');
        return;
      }

      // Extraer video ID más robusto
      let videoId = '';
      const urlPattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(urlPattern);
      
      if (match && match[1]) {
        videoId = match[1];
      } else {
        console.error('❌ No se pudo extraer video ID de:', url);
        Alert.alert('Error', 'No se pudo identificar el video');
        return;
      }


      // Construir URLs
      const youtubeAppUrl = `youtube://watch?v=${videoId}`;
      const youtubeBrowserUrl = `https://www.youtube.com/watch?v=${videoId}`;


      // 1. Intentar abrir en la app de YouTube primero
      try {
        const canOpenYouTube = await Linking.canOpenURL(youtubeAppUrl);
        
        if (canOpenYouTube) {
          await Linking.openURL(youtubeAppUrl);
          return;
        }
      } catch (youtubeError) {
        console.error('⚠️ Error verificando app YouTube:', youtubeError);
      }

      // 2. En emuladores, canOpenURL puede fallar para navegadores
      // Intentar abrir directamente en navegador sin verificar canOpenURL
      
      try {
        await Linking.openURL(youtubeBrowserUrl);
        return;
      } catch (browserError) {
        console.error('❌ Error abriendo en navegador:', browserError);
      }

      // 3. Si el método directo falla, intentar con diferentes esquemas
      const alternativeUrls = [
        `https://m.youtube.com/watch?v=${videoId}`, // Versión móvil
        `https://youtube.com/watch?v=${videoId}`, // Sin www
        `intent://www.youtube.com/watch?v=${videoId}#Intent;package=com.google.android.youtube;scheme=https;end`, // Intent de Android
      ];

      for (const altUrl of alternativeUrls) {
        try {
          await Linking.openURL(altUrl);
          return;
        } catch (altError) {
          console.error('⚠️ URL alternativa falló:', altError instanceof Error ? altError.message : 'Error desconocido');
        }
      }

      // 4. Si todo falla, mostrar opciones al usuario
      console.error('❌ Todas las opciones fallaron');
      Alert.alert(
        'Video no disponible', 
        `No se pudo abrir el video en este dispositivo.\n\nVideo: ${title.substring(0, 50)}...`,
        [
          { text: 'Cerrar', style: 'cancel' },
          { 
            text: 'Copiar enlace', 
            onPress: () => {
              Alert.alert(  
                'Enlace copiado', 
                `Enlace del video:\n${youtubeBrowserUrl}`,
                [{ text: 'OK' }]
              );
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error general abriendo video:', error);
      Alert.alert(
        'Error', 
        'Ocurrió un error al abrir el video. Esto puede ser normal en emuladores.',
        [
          { text: 'OK' },
          { 
            text: 'Ver detalles', 
            onPress: () => {
              Alert.alert('Detalles del error', `${error}`);
            }
          }
        ]
      );
    }
  };

  const openYouTubeChannel = async () => {
    try {
      const channelUrl = 'https://www.youtube.com/@maximafm955ceres';
      // Intentar abrir en la app de YouTube
      const youtubeUrl = 'youtube://channel/UCBy5F5apvBB_Yp4Vcbwkipw';
      const canOpenYouTube = await Linking.canOpenURL(youtubeUrl);
      
      if (canOpenYouTube) {
        await Linking.openURL(youtubeUrl);
      } else {
        // Si no está la app de YouTube, abrir en navegador
        await Linking.openURL(channelUrl);
      }
    } catch (error) {
      console.error('Error abriendo canal de YouTube:', error);
      Alert.alert('Error', 'No se pudo abrir el canal de YouTube');
    }
  };

  // Función temporal de debug para mostrar información de videos
  const showDebugInfo = () => {
    if (videos.length === 0) {
      Alert.alert('Debug', 'No hay videos cargados');
      return;
    }

    const firstVideo = videos[0];
    const debugInfo = `
🔍 DEBUG INFO:
📹 Videos cargados: ${videos.length}
📝 Primer video: ${firstVideo.title}
🔗 URL: ${firstVideo.link}
🆔 ID: ${firstVideo.id}
🖼️ Thumbnail: ${firstVideo.thumbnail}
📅 Fecha: ${firstVideo.publishDate}
    `.trim();

    Alert.alert(
      'Debug - Videos RSS',
      debugInfo,
      [
        { text: 'Cerrar' },
        { 
          text: 'Probar primer video', 
          onPress: () => openVideo(firstVideo.link, firstVideo.title)
        }
      ]
    );

  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Actualizado ahora';
    if (diffMinutes < 60) return `Actualizado hace ${diffMinutes} min`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Actualizado hace ${diffHours}h`;
    
    return `Actualizado ${lastUpdate.toLocaleDateString('es-AR')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header de la sección */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="logo-youtube" size={24} color="#ff4757" />
          <Text style={styles.sectionTitle}>Últimos Videos</Text>
        </View>
        
        <View style={styles.headerActions}>
          
          
          <TVTouchable 
            style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}
            onPress={onRefresh}
            disabled={loading}
          >
            <Ionicons 
              name={loading ? "hourglass" : "refresh-outline"} 
              size={20} 
              color={loading ? "#666" : "#ff4757"} 
            />
          </TVTouchable>
        </View>
      </View>
      
      <Text style={styles.lastUpdateText}>
        {formatLastUpdate()}
      </Text>

      {/* Loading indicator */}
      {loading && videos.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4757" />
          <Text style={styles.loadingText}>Cargando videos...</Text>
        </View>
      ) : null}

      {/* Lista de videos */}
      {videos.length > 0 ? (
        <>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.videosScroll}
            contentContainerStyle={styles.videosScrollContent}
            scrollEnabled={Platform.isTV ? false : true}
          >
            {videos.map((video) => (
              <TVTouchable
                key={video.id}
                style={styles.videoCard}
                onPress={() => openVideo(video.link, video.title)}
              >
                <LinearGradient
                  colors={['rgba(255, 71, 87, 0.15)', 'rgba(255, 71, 87, 0.05)']}
                  style={styles.cardGradient}
                >
                  {/* Thumbnail del video */}
                  <View style={styles.thumbnailContainer}>
                    <Image 
                      source={{ uri: video.thumbnail }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.playOverlay}>
                      <Ionicons name="play" size={24} color="#fff" />
                    </View>
                  </View>

                  {/* Header de la card con fecha */}
                  <View style={styles.cardHeader}>
                    <View style={styles.liveBadge}>
                      <Ionicons name="radio" size={12} color="#fff" />
                      <Text style={styles.liveText}>LA MAX</Text>
                    </View>
                    <Text style={styles.dateText}>{video.publishDate}</Text>
                  </View>

                  {/* Contenido principal */}
                  <View style={styles.cardContent}>
                    {/* Título del video */}
                    <Text style={styles.videoTitle} numberOfLines={3}>
                      {video.title}
                    </Text>

                    {/* Canal */}
                    <Text style={styles.channelText} numberOfLines={1}>
                      {video.creator}
                    </Text>
                  </View>

                  {/* Footer con ícono de play */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.watchText}>Ver video</Text>
                    <Ionicons name="play-circle-outline" size={16} color="#ff4757" />
                  </View>
                </LinearGradient>
              </TVTouchable>
            ))}
          </ScrollView>

          {/* Botón para ver más contenidos */}
          <TVTouchable 
            style={styles.viewMoreButton}
            onPress={openYouTubeChannel}
          >
            <LinearGradient
              colors={['#ff4757', '#ff3742']}
              style={styles.viewMoreGradient}
            >
              <Ionicons name="logo-youtube" size={20} color="#fff" />
              <Text style={styles.viewMoreText}>Ver más contenidos</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </LinearGradient>
          </TVTouchable>
        </>
      ) : null}

      {/* Estado vacío */}
      {!loading && videos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="logo-youtube" size={48} color="#666" />
          <Text style={styles.emptyText}>No hay videos disponibles</Text>
          <TVTouchable style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryText}>Intentar nuevamente</Text>
          </TVTouchable>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  debugButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
    marginRight: 4,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
  },
  refreshButtonDisabled: {
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 20,
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
  },
  videosScroll: {
    marginTop: 16,
  },
  videosScrollContent: {
    paddingHorizontal: 16,
  },
  videoCard: {
    width: 280,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 12,
    minHeight: 200,
  },
  thumbnailContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  thumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#2d3748',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#a0aec0',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 18,
    marginBottom: 8,
  },
  channelText: {
    fontSize: 12,
    color: '#a0aec0',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  watchText: {
    fontSize: 12,
    color: '#ff4757',
    fontWeight: '500',
  },
  viewMoreButton: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewMoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  viewMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderRadius: 8,
  },
  retryText: {
    color: '#ff4757',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default YouTubeSection; 