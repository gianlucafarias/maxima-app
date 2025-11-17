import { STREAMING_URLS } from '@/config/constants';
import { TVTouchable } from '@/components/TVTouchable';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

interface VideoPlayerProps {
  selectedVideoId: string | null;
  onBackToLive: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  selectedVideoId,
  onBackToLive
}) => {
  const getVideoSource = () => {
    if (selectedVideoId) {
      // URL mejorada de YouTube con parámetros adicionales para mejor compatibilidad
      const youtubeUrl = `https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=https://expo.dev&widgetid=1`;
      
      return {
        uri: youtubeUrl,
        headers: {
          'Referer': 'https://expo.dev/',
          'Origin': 'https://expo.dev',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile; rv:81.0) Gecko/81.0 Firefox/81.0'
        }
      };
    }
    
    // Para Twitch, mantener la configuración actual
    return {
      uri: `https://player.twitch.tv/?channel=${STREAMING_URLS.twitchChannel}&parent=localhost&parent=127.0.0.1&parent=exp.host&parent=expo.dev&autoplay=false&muted=false`
    };
  };

  const openInNativeYouTube = async (videoId: string) => {
    try {
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const canOpen = await Linking.canOpenURL(youtubeUrl);
      
      if (canOpen) {
        await Linking.openURL(youtubeUrl);
      } else {
        console.warn('No se puede abrir YouTube');
      }
    } catch (error) {
      console.error('Error abriendo YouTube:', error);
    }
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.loadingGradient}
      >
        <Ionicons name="videocam" size={40} color="white" />
        <Text style={styles.loadingText}>
          {selectedVideoId ? 'Cargando YouTube...' : 'Cargando Twitch...'}
        </Text>
      </LinearGradient>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <LinearGradient
        colors={['#ff6b6b', '#ee5a24', '#e55039']}
        style={styles.errorGradient}
      >
        <Ionicons name="warning" size={40} color="white" />
        <Text style={styles.errorTitle}>Error de carga</Text>
        <Text style={styles.errorText}>
          {selectedVideoId 
            ? 'No se pudo cargar el video de YouTube. Intenta con el reproductor nativo.' 
            : 'No se pudo cargar el stream de Twitch.'}
        </Text>
        {selectedVideoId && (
          <TVTouchable 
            style={styles.nativePlayerButton}
            onPress={() => openInNativeYouTube(selectedVideoId)}
          >
            <Ionicons name="open" size={16} color="white" />
            <Text style={styles.nativePlayerText}>Abrir en YouTube</Text>
          </TVTouchable>
        )}
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.videoContainer} collapsable={false}>
      <WebView
        source={getVideoSource()}
        style={styles.webView}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={false}
        bounces={false}
        scrollEnabled={false}
        allowsLinkPreview={false}
        renderLoading={renderLoading}
        renderError={renderError}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
        }}
        // Configuraciones adicionales para mejorar compatibilidad
        mixedContentMode="compatibility"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        // Headers adicionales para YouTube
        injectedJavaScript={selectedVideoId ? `
          // Configurar referrer para YouTube
          if (document.referrer === '') {
            Object.defineProperty(document, 'referrer', {
              value: 'https://expo.dev/',
              writable: false
            });
          }
          true;
        ` : undefined}
      />
        {selectedVideoId && (
        <TVTouchable 
          style={styles.backToLiveButton}
          onPress={onBackToLive}
        >
          <Ionicons name="radio" size={16} color="white" />
          <Text style={styles.backToLiveText}>Volver al Live</Text>
        </TVTouchable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    width: Platform.isTV ? width * 0.38 : width * 0.85,
    height: Platform.isTV ? height * 0.35 : width * 0.6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorGradient: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    margin: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  nativePlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  nativePlayerText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 5,
    fontWeight: '600',
  },
  backToLiveButton: {
    position: 'absolute',
    top: Platform.isTV ? 20 : 10,
    left: Platform.isTV ? 20 : 10,
    padding: Platform.isTV ? 12 : 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
  },
  backToLiveText: {
    fontSize: Platform.isTV ? 18 : 14,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 5,
  },
});

export default VideoPlayer; 