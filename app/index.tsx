import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Importaciones de componentes separados
import { LiveStreamIndicator } from '@/components/LiveStreamIndicator';
import { MaximaLogo } from '@/components/MaximaLogo';
import NewsSection from '@/components/NewsSection';
import { TrackPlayerRadio, TrackPlayerRadioRef } from '@/components/TrackPlayerRadio';
import VideoPlayer from '@/components/VideoPlayer';
import YouTubeSection from '@/components/YouTubeSection';

// Importaciones de hooks personalizados
import { FirebaseNotification, useFirebaseNotifications } from '@/hooks/useFirebaseNotifications';
import { useNews } from '@/hooks/useNews';

import { useYouTube } from '@/hooks/useYouTube';
import { useYouTubeRSS } from '@/hooks/useYouTubeRSS';

// Importaciones de configuraciones y utilidades
import { STREAMING_URLS } from '@/config/constants';
import { styles } from '@/styles/RadioScreen.styles';


export default function RadioScreen() {
  // Estados locales
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const router = useRouter();

  const openInfo = () => {
    console.log('🔍 Botón info presionado - intentando navegar a info');
    console.log('🔍 Router object:', router);
    console.log('🔍 Router available methods:', Object.keys(router));
    
    try {
      console.log('🔍 Antes de router.push');
      router.push('/info');
      console.log('✅ router.push ejecutado - navegación a info');
      
      // Verificar después de un delay
      setTimeout(() => {
        console.log('🔍 Verificando navegación después de 500ms');
      }, 500);
    } catch (error) {
      console.error('❌ Error navegando a info:', error);
      if (error instanceof Error) {
        console.error('❌ Error stack:', error.stack);
      }
    }
  };

  const { 
    liveStream,
    loadInitialData,
    updateManualCountDisplay,
    checkForLiveStreamsAndReturn,
    setLiveStream,
  } = useYouTube();

  // Hook de notificaciones Firebase
  const {
    isPermissionGranted,
    setOnNotificationReceived,
    setOnNotificationPressed,
    subscribeToTopic,
  } = useFirebaseNotifications();

  // Hook de noticias
  const {
    news,
    loading: newsLoading,
    lastUpdate: newsLastUpdate,
    refreshNews
  } = useNews();

  // Hook de videos YouTube RSS
  const {
    videos: youtubeVideos,
    loading: youtubeLoading,
    lastUpdate: youtubeLastUpdate,
    refreshVideos
  } = useYouTubeRSS();

  // Referencia para el TrackPlayerRadio
  const trackPlayerRadioRef = useRef<TrackPlayerRadioRef | null>(null);

  // Cargar datos iniciales y verificar livestreams
  useEffect(() => {
    loadInitialData(); // Solo carga desde cache si existe
    updateManualCountDisplay(); // Actualizar contador de actualizaciones
    // Configurar callbacks de notificaciones
    setupNotificationCallbacks();
    // Suscribirse a topics de Firebase
    setupFirebaseTopics();
    
    /* 🚀 NUEVA FUNCIONALIDAD: Verificar livestreams al cargar la app
    const checkInitialLiveStreams = async () => {
      try {
        console.log('🔍 Verificación inicial de livestreams...');
        await checkForLiveStreams();
      } catch (error) {
        console.error('❌ Error en verificación inicial de livestreams:', error);
      }
    };

    
    // Ejecutar después de un pequeño delay para que la app termine de cargar
    const timer = setTimeout(checkInitialLiveStreams, 2000);
   */ 
    //return () => clearTimeout(timer);
  }, []);

  // Configurar los callbacks para manejar notificaciones Firebase
  const setupNotificationCallbacks = () => {
    // Callback cuando se recibe una notificación (app abierta)
    setOnNotificationReceived((notification: FirebaseNotification) => {
      
      // Verificar que notification no sea null
      if (!notification) {
        return;
      }
      
      // Lógica específica según el tipo
      if (notification.data?.type) {
        switch (notification.data.type) {
          case 'live_stream':
            // Podrías mostrar un toast o banner informativo
            break;
        }
      }
    });

    // Callback cuando el usuario toca una notificación
    setOnNotificationPressed((notification: FirebaseNotification) => {
      
      // Verificar que notification no sea null
      if (!notification) {
        return;
      }
      
      // Navegar según el tipo de notificación
      if (notification.data?.type) {
        switch (notification.data.type) {
          case 'live_stream':
            if (notification.data.videoId) {
              setSelectedVideoId(notification.data.videoId);
              setIsVideoMode(true);
            }
            break;
          case 'new_program':
            // Scrollear a la sección de videos
            break;
          case 'urgent':
          case 'breaking_news':
            // Podrías abrir una pantalla especial o mostrar el contenido
            break;
        }
      }
    });
  };

  // Configurar topics de Firebase
  const setupFirebaseTopics = async () => {
    if (isPermissionGranted) {
      // Suscribirse a topics generales
      await subscribeToTopic('general');
      await subscribeToTopic('livestreams');
      await subscribeToTopic('programs');
      
    }
  };

  const toggleMode = async () => {
    const newVideoMode = !isVideoMode;
    
    // Si está cambiando a modo video, parar el audio
    if (newVideoMode && trackPlayerRadioRef.current) {
      try {
        await trackPlayerRadioRef.current.stopAudio();
      } catch (error) {
        console.error('❌ Error parando audio:', error);
      }
    }
    
    setIsVideoMode(newVideoMode);
    
    // verificar livestreams cuando se entra a modo video
    if (newVideoMode) {
      console.log('🔍 Cambiando a modo video - verificando livestreams de YouTube...');
      try {
        const liveResult = await checkForLiveStreamsAndReturn();
        if (liveResult) {
          console.log('✅ Livestream encontrado:', liveResult.title);
          // Automáticamente cambiar al livestream detectado
          setSelectedVideoId(liveResult.videoId);
        } else {
          console.log('ℹ️ No hay livestreams activos - mostrando Twitch por defecto');
          // Asegurar que no hay video seleccionado para mostrar Twitch
          setSelectedVideoId(null);
        }
      } catch (error) {
        console.error('❌ Error verificando livestreams al cambiar a modo video:', error);
        // En caso de error, mostrar Twitch por defecto
        setSelectedVideoId(null);
      }
    }
  };


  const handleBackToLive = () => {
    setSelectedVideoId(null);
  };

  // Función para iniciar livestream
  const startLiveStream = async (liveStreamData: any) => {
    setSelectedVideoId(liveStreamData.videoId);
    setIsVideoMode(true);
    setLiveStream(liveStreamData);
  };

  // Función para abrir WhatsApp
  const openWhatsApp = () => {
    const phoneNumber = '+54349115416237'; // Reemplaza con el número de teléfono de Máxima FM https://wa.me/54349115416237
    const message = encodeURIComponent('¡Hola! Estoy escuchando 📻');
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
    const webWhatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          // Si no puede abrir la app nativa, intenta con la versión web
          return Linking.openURL(webWhatsappUrl);
        }
      })
      .catch((err) => {
        console.error('Error abriendo WhatsApp:', err);
        // Como fallback, abre la versión web
        Linking.openURL(webWhatsappUrl);
      });
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Logo Header */}
        <View style={styles.logoContainer}>
          <View style={styles.leftSpacer} />
          <View style={styles.logoCenter}>
            <TouchableOpacity>
              <MaximaLogo width={160} height={50} color="white" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.infoButton} onPress={() => openInfo()}>
            <Ionicons name="information-circle-outline" size={28} color="#a29bfe" />
          </TouchableOpacity>
        </View>

        {/* Mode Toggle Switch */}
        <View style={styles.switchContainer}>
          <TouchableOpacity 
            style={[styles.switchButton, !isVideoMode && styles.switchButtonActive]}
            onPress={() => !isVideoMode || toggleMode()}
          >
            <Ionicons 
              name="volume-high" 
              size={20} 
              color={!isVideoMode ? 'white' : '#a29bfe'} 
            />
            <Text style={[styles.switchText, !isVideoMode && styles.switchTextActive]}>
              Audio
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.switchButton, isVideoMode && styles.switchButtonActive]}
            onPress={() => isVideoMode || toggleMode()}
          >
            <Ionicons 
              name="videocam" 
              size={20} 
              color={isVideoMode ? 'white' : '#a29bfe'} 
            />
            <Text style={[styles.switchText, isVideoMode && styles.switchTextActive]}>
              Video
            </Text>
          </TouchableOpacity>
        </View>

        {/* Central Player */}
        <View style={styles.playerContainer} collapsable={false}>
          {isVideoMode ? (
            <View key="video-player" collapsable={false}>
              <VideoPlayer 
                selectedVideoId={selectedVideoId}
                onBackToLive={handleBackToLive}
              />
            </View>
          ) : (
            <View key="audio-player" collapsable={false}>
              <TrackPlayerRadio 
                streamUrl={STREAMING_URLS.radioStream}
                title="Máxima FM 95.5"
                artist="En vivo desde Ceres"
                ref={trackPlayerRadioRef}
              />
            </View>
          )}

          {/* Station Info */}
          <View style={styles.stationInfo}>
            <Text style={styles.stationName}>La Max Stream Radio</Text>
            <Text style={styles.frequency}>95.5 FM</Text>
            
            
            {/* Componente unificado para mostrar información del livestream */}
            <LiveStreamIndicator
              liveStream={liveStream}
              mode={isVideoMode ? 'video' : 'audio'}
              selectedVideoId={selectedVideoId}
              onPress={() => startLiveStream(liveStream)}
            />
          </View>
          
        </View>


        {/* Volume and Quality Info */}
        <View style={styles.controlsContainer}>
          <View style={styles.whatsappContainer}>
            <TouchableOpacity 
              style={styles.whatsappButton}
              onPress={openWhatsApp}
            >
              <Ionicons 
                name="logo-whatsapp" 
                size={28} 
                color="white" 
              />
              <Text style={styles.whatsappText}>
                Enviar mensaje
              </Text>
            </TouchableOpacity>
          </View>

          
        </View>

        {/* Sección de Noticias */}
        <NewsSection
          news={news}
          loading={newsLoading}
          lastUpdate={newsLastUpdate}
          onRefresh={refreshNews}
        />

        {/* Sección de YouTube con RSS */}
        <YouTubeSection
          videos={youtubeVideos}
          loading={youtubeLoading}
          lastUpdate={youtubeLastUpdate}
          onRefresh={refreshVideos}
        />

        {/* Bottom Space */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </LinearGradient>
  );
}