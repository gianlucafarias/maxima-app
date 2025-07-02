import { CACHE_CONFIG, LIVE_CHECK_CONFIG, STREAMING_URLS } from '@/config/constants';
import { LiveStream, YouTubeVideo } from '@/types/youtube';
import { formatDuration } from '@/utils/formatting';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { useState } from 'react';

export const useYouTube = () => {
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [loadingYoutube, setLoadingYoutube] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [manualUpdatesLeft, setManualUpdatesLeft] = useState<number>(CACHE_CONFIG.maxManualUpdates);
  const [loadedPlaylists, setLoadedPlaylists] = useState<Set<string>>(new Set());
  const [playlistLoading, setPlaylistLoading] = useState<Set<string>>(new Set());
  const [liveStream, setLiveStream] = useState<LiveStream | null>(null);
  const [checkingLive, setCheckingLive] = useState(false);
  const [apiCallsRemaining, setApiCallsRemaining] = useState(LIVE_CHECK_CONFIG.maxAPICallsPerHour);
  const [lastAPICall, setLastAPICall] = useState<Date | null>(null);
  const [useRSSOnly, setUseRSSOnly] = useState(false);

  // Estados para caché de livestreams
  const [lastLiveCheck, setLastLiveCheck] = useState<Date | null>(null);
  const [cachedLiveResult, setCachedLiveResult] = useState<any>(null);

  // Función para obtener y verificar contador de actualizaciones manuales
  const getManualUpdateCount = async (): Promise<{ count: number; date: string }> => {
    try {
      const data = await AsyncStorage.getItem(CACHE_CONFIG.manualCountKey);
      if (!data) {
        return { count: 0, date: new Date().toDateString() };
      }
      
      const parsed = JSON.parse(data);
      const today = new Date().toDateString();
      
      // Si es un nuevo día, resetear contador
      if (parsed.date !== today) {
        return { count: 0, date: today };
      }
      
      return parsed;
    } catch (error) {
      console.error('Error getting manual update count:', error);
      return { count: 0, date: new Date().toDateString() };
    }
  };

  // Función para incrementar contador de actualizaciones manuales
  const incrementManualCount = async (): Promise<boolean> => {
    try {
      const current = await getManualUpdateCount();
      
      if (current.count >= CACHE_CONFIG.maxManualUpdates) {
        return false; // Límite alcanzado
      }
      
      const newData = {
        count: current.count + 1,
        date: current.date
      };
      
      await AsyncStorage.setItem(CACHE_CONFIG.manualCountKey, JSON.stringify(newData));
      setManualUpdatesLeft(CACHE_CONFIG.maxManualUpdates - newData.count);
            return true;
    } catch (error) {
      console.error('Error incrementing manual count:', error);
      return false;
    }
  };

  // Función para actualizar el contador de actualizaciones restantes
  const updateManualCountDisplay = async () => {
    const current = await getManualUpdateCount();
    setManualUpdatesLeft(CACHE_CONFIG.maxManualUpdates - current.count);
  };

  // Función para verificar si el cache es válido
  const isCacheValid = async (): Promise<boolean> => {
    try {
      const lastUpdate = await AsyncStorage.getItem(CACHE_CONFIG.lastUpdateKey);
      if (!lastUpdate) return false;

      const lastUpdateTime = new Date(lastUpdate);
      const now = new Date();
      const timeDiff = now.getTime() - lastUpdateTime.getTime();

      return timeDiff < CACHE_CONFIG.maxCacheAge;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  };

  // Función para cargar videos desde cache
  const loadFromCache = async (): Promise<YouTubeVideo[]> => {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_CONFIG.cacheKey);
      const lastUpdate = await AsyncStorage.getItem(CACHE_CONFIG.lastUpdateKey);
      
      if (cachedData && lastUpdate) {
        setLastUpdateTime(new Date(lastUpdate).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        }));
        return JSON.parse(cachedData);
      }
      return [];
    } catch (error) {
      console.error('Error loading from cache:', error);
      return [];
    }
  };

  // Función para guardar videos en cache
  const saveToCache = async (videos: YouTubeVideo[]): Promise<void> => {
    try {
      const now = new Date().toISOString();
      await AsyncStorage.setItem(CACHE_CONFIG.cacheKey, JSON.stringify(videos));
      await AsyncStorage.setItem(CACHE_CONFIG.lastUpdateKey, now);
      
      setLastUpdateTime(new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }));
      
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  // Función para cargar los últimos videos del canal
  const fetchLatestChannelVideos = async (): Promise<void> => {
    if (loadedPlaylists.has('channel_latest') || playlistLoading.has('channel_latest')) {
      return; // Ya está cargada o cargándose
    }

    setPlaylistLoading(prev => new Set([...prev, 'channel_latest']));

    try {
      // Obtener los últimos videos del canal directamente
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${STREAMING_URLS.youtubeApiKey}&channelId=${STREAMING_URLS.youtubeChannelId}&part=snippet&order=date&type=video&maxResults=5`
      );

      if (!searchResponse.ok) {
        throw new Error(`Error obteniendo videos del canal: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      
      if (searchData.error) {
        throw new Error(`YouTube API Error: ${searchData.error.message}`);
      }

      // Obtener IDs de videos para conseguir la duración
      const videoIds = searchData.items
        .map((item: any) => item.id.videoId)
        .join(',');

      if (videoIds) {
        const detailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?key=${STREAMING_URLS.youtubeApiKey}&id=${videoIds}&part=contentDetails`
        );
        
        const detailsData = await detailsResponse.json();
        
        // Procesar videos del canal
        const channelVideos: YouTubeVideo[] = searchData.items.map((item: any, index: number) => {
          const details = detailsData.items?.[index];
          const duration = details ? formatDuration(details.contentDetails.duration) : 'N/A';
          
          return {
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            description: item.snippet.description || 'Sin descripción disponible',
            publishedAt: item.snippet.publishedAt,
            duration: duration,
            playlistName: 'Máxima FM - Últimos Videos',
            playlistColor: '#6c5ce7'
          };
        });

        // Reemplazar todos los videos con los nuevos
        setYoutubeVideos(channelVideos);

        // Marcar como cargado
        setLoadedPlaylists(prev => new Set([...prev, 'channel_latest']));
        
      }
    } catch (error) {
      console.error(`❌ Error cargando videos del canal:`, error);
      
      // En caso de error, agregar datos de ejemplo
      const mockVideo: YouTubeVideo = {
        id: 'mock_channel_video',
        title: 'Máxima FM - Contenido reciente del canal',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        description: 'Video de ejemplo del canal',
        publishedAt: new Date().toISOString(),
        duration: '15:00',
        playlistName: 'Máxima FM - Últimos Videos',
        playlistColor: '#6c5ce7'
      };

      setYoutubeVideos([mockVideo]);
      setLoadedPlaylists(prev => new Set([...prev, 'channel_latest']));
    } finally {
      setPlaylistLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete('channel_latest');
        return newSet;
      });
    }
  };

  // Función para actualización manual (carga los últimos videos del canal)
  const fetchAllChannelVideos = async (forceUpdate: boolean = false, isManual: boolean = false): Promise<void> => {
    console.log('🔍 Cargando últimos videos del canal...');
    
    // Si es manual, verificar límite de actualizaciones
    if (isManual) {
      const canUpdate = await incrementManualCount();
      if (!canUpdate) {
        console.log('❌ Límite de actualizaciones manuales alcanzado para hoy');
        return;
      }
    }
    
    setLoadingYoutube(true);
    
    try {
      // Cargar los últimos videos del canal
      await fetchLatestChannelVideos();
      
    } catch (error) {
      console.error('❌ Error cargando videos del canal:', error);
    }
    
    setLoadingYoutube(false);
  };

  // Función para cargar desde cache (solo si el usuario lo solicita)
  const loadInitialData = async (): Promise<void> => {
    
    try {
      const cachedVideos = await loadFromCache();
      if (cachedVideos.length > 0) {
        setYoutubeVideos(cachedVideos);
        
        // Marcar canal como cargado si hay videos en cache
        if (cachedVideos.length > 0) {
          setLoadedPlaylists(new Set(['channel_latest']));
        }
        
      } else {
      }
    } catch (error) {
      console.error('❌ Error cargando cache:', error);
    }
  };

  const playYouTubeVideo = async (videoId: string) => {
    
    try {
      // Intentar abrir en la app de YouTube
      const youtubeAppUrl = `youtube://watch?v=${videoId}`;
      const youtubeWebUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      const canOpenApp = await Linking.canOpenURL(youtubeAppUrl);
      
      if (canOpenApp) {
        // Abrir en la app de YouTube
        await Linking.openURL(youtubeAppUrl);
      } else {
        // Fallback: abrir en el navegador
        await Linking.openURL(youtubeWebUrl);
      }
    } catch (error) {
      console.error('❌ Error abriendo video de YouTube:', error);
      // Último recurso: intentar abrir en navegador
      try {
        await Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError);
      }
    }
  };

  // Verificar si podemos usar caché en lugar de API
  const canUseLiveCache = (): boolean => {
    if (!lastLiveCheck || !cachedLiveResult) return false;
    
    const now = new Date();
    const minutesSinceLastCheck = (now.getTime() - lastLiveCheck.getTime()) / (1000 * 60);
    
    return minutesSinceLastCheck < LIVE_CHECK_CONFIG.cacheMinutes;
  };

  // Función principal optimizada para verificar livestreams
  const checkForLiveStreamsAndReturn = async (): Promise<any> => {
    if (checkingLive) return liveStream;
    
    setCheckingLive(true);
    
    try {
      // 🚀 OPTIMIZACIÓN 1: Usar caché si es reciente
      if (canUseLiveCache()) {
        console.log(`📦 Usando resultado cacheado (${Math.round((new Date().getTime() - lastLiveCheck!.getTime()) / (1000 * 60))}min ago)`);
        setLiveStream(cachedLiveResult);
        setCheckingLive(false);
        return cachedLiveResult;
      }

      console.log('🔄 RSS verificando livestreams...');
      const rssResult = await checkLiveStreamViaRSS();
      if (rssResult) {
        console.log('✅ RSS encontró livestream');
        setLiveStream(rssResult);
        setCachedLiveResult(rssResult);
        setLastLiveCheck(new Date());
        return rssResult;
      }

      // 🚀 OPTIMIZACIÓN 2: Solo usar API si realmente necesitamos
      if (canUseAPI()) {
        console.log('🔄 RSS no encontró livestreams, verificando con API optimizada...');
        incrementAPICall();
        
        const apiResult = await checkLiveStreamViaAPI();
        
        // Cachear resultado (incluso si es null)
        setCachedLiveResult(apiResult);
        setLastLiveCheck(new Date());
        
        if (apiResult) {
          setLiveStream(apiResult);
          return apiResult;
        } else {
          console.log('ℹ️ No hay livestreams activos');
          setLiveStream(null);
          return null;
        }
      } else {
        console.log('⚠️ No hay cuota de API disponible, usando solo RSS');
        setLiveStream(null);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error verificando livestreams:', error);
      setLiveStream(null);
      return null;
    } finally {
      setCheckingLive(false);
    }
  };

  // Método usando RSS feed (sin límites de API)
  const checkLiveStreamViaRSS = async (): Promise<any> => {
    try {
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${STREAMING_URLS.youtubeChannelId}`;
      
      const response = await fetch(rssUrl);
      if (!response.ok) {
        throw new Error(`RSS Error: ${response.status}`);
      }
      
      const xmlText = await response.text();
      const videoMatches = xmlText.match(/<entry>[\s\S]*?<\/entry>/g);
      
      if (videoMatches && videoMatches.length > 0) {
        // Revisar los 2 videos más recientes
        for (let i = 0; i < Math.min(2, videoMatches.length); i++) {
          const video = videoMatches[i];
          
          const videoIdMatch = video.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
          const titleMatch = video.match(/<title>(.*?)<\/title>/);
          const publishedMatch = video.match(/<published>(.*?)<\/published>/);
          
          if (videoIdMatch && titleMatch) {
            const videoId = videoIdMatch[1];
            const title = titleMatch[1];
            const published = publishedMatch ? new Date(publishedMatch[1]) : new Date();
            
            // Verificar si es muy reciente o tiene keywords de live
            const now = new Date();
            const timeDiff = now.getTime() - published.getTime();
            const hoursAgo = timeDiff / (1000 * 60 * 60);
            
            const liveKeywords = ['live', 'directo', 'vivo', 'transmisión', 'streaming'];
            const titleLower = title.toLowerCase();
            const hasLiveKeywords = liveKeywords.some(keyword => titleLower.includes(keyword));
            
            if (hoursAgo <= 2 || hasLiveKeywords) {
              return {
                videoId: videoId,
                title: title,
                thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                channelTitle: 'Máxima FM',
                isLive: true
              };
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error con RSS:', error);
      return null;
    }
  };

  // Verificación via API (con cuota)
  const checkLiveStreamViaAPI = async (): Promise<any> => {
    // Verificar que tengamos API key
    if (!STREAMING_URLS.youtubeApiKey) {
      console.error('❌ YouTube API Key no configurada');
      console.warn('💡 Configura EXPO_PUBLIC_YOUTUBE_API_KEY en tu .env');
      throw new Error('YouTube API Key not configured');
    }

    if (!STREAMING_URLS.youtubeChannelId) {
      console.error('❌ YouTube Channel ID no configurado');
      console.warn('💡 Configura EXPO_PUBLIC_YOUTUBE_CHANNEL_ID en tu .env');
      throw new Error('YouTube Channel ID not configured');
    }

    console.log('🔍 Verificando livestreams vía API (optimizada)...');

    try {
      // MÉTODO 1: Buscar livestreams directamente (más eficiente)
      console.log('🎯 Intentando endpoint directo de livestreams...');
      const liveSearchUrl = `https://www.googleapis.com/youtube/v3/search?key=${STREAMING_URLS.youtubeApiKey}&channelId=${STREAMING_URLS.youtubeChannelId}&part=snippet&eventType=live&type=video&maxResults=1`;
      
      const liveResponse = await fetch(liveSearchUrl);
      
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        console.log('✅ Endpoint directo funcionó');
        
        if (liveData.items && liveData.items.length > 0) {
          const liveVideo = liveData.items[0];
          console.log('🔴 LIVESTREAM ACTIVO encontrado:', liveVideo.snippet.title);
          
          return {
            videoId: liveVideo.id.videoId,
            title: liveVideo.snippet.title,
            thumbnail: liveVideo.snippet.thumbnails.medium?.url || liveVideo.snippet.thumbnails.default?.url,
            channelTitle: liveVideo.snippet.channelTitle,
            isLive: true
          };
        } else {
          console.log('ℹ️ No hay livestreams activos (endpoint directo)');
          return null;
        }
      }
      
      // MÉTODO 2: Fallback - buscar videos recientes pero optimizado
      console.log('⚠️ Endpoint directo falló, usando método fallback...');
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${STREAMING_URLS.youtubeApiKey}&channelId=${STREAMING_URLS.youtubeChannelId}&part=snippet&type=video&order=date&maxResults=2`;
      
      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('❌ Response error text:', errorText);
        
        if (searchResponse.status === 403) {
          console.warn('🚨 Error 403: Cuota excedida o permisos insuficientes');
          setUseRSSOnly(true);
          throw new Error('API quota exceeded or insufficient permissions');
        }
        if (searchResponse.status === 400) {
          console.error('🚨 Error 400: Bad Request - Verificar API key y channel ID');
          throw new Error(`Bad Request (400): ${errorText}`);
        }
        throw new Error(`API Error: ${searchResponse.status} - ${errorText}`);
      }

      const searchData = await searchResponse.json();
      
      if (searchData.error) {
        console.error('❌ YouTube API Error:', searchData.error);
        if (searchData.error.code === 403) {
          setUseRSSOnly(true);
          throw new Error('API quota exceeded');
        }
        throw new Error(`YouTube API Error: ${searchData.error.message}`);
      }

      if (searchData.items && searchData.items.length > 0) {
        console.log(`📹 Verificando ${searchData.items.length} videos recientes...`);
        
        // Solo verificar videos MUY recientes (última hora) o con keywords obvias
        for (const video of searchData.items) {
          const title = video.snippet.title.toLowerCase();
          const publishTime = new Date(video.snippet.publishTime || video.snippet.publishedAt);
          const now = new Date();
          const minutesAgo = (now.getTime() - publishTime.getTime()) / (1000 * 60);
          
          // Keywords más específicas para livestreams
          const strongLiveKeywords = ['live', 'en vivo', 'directo', 'streaming ahora'];
          const hasStrongKeywords = strongLiveKeywords.some(keyword => title.includes(keyword));
          
          console.log(`🎥 "${video.snippet.title}" - ${minutesAgo.toFixed(0)}min ago`);
          
          // Solo verificar si es MUY reciente O tiene keywords muy específicas
          if (minutesAgo <= 60 || hasStrongKeywords) {
            console.log('🔍 Verificando este video...');
            
            const isReallyLive = await quickVerifyVideoIsLive(video.id.videoId);
            
            if (isReallyLive) {
              return {
                videoId: video.id.videoId,
                title: video.snippet.title,
                thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
                channelTitle: video.snippet.channelTitle,
                isLive: true
              };
            }
          } else {
            console.log('⏭️ Demasiado viejo, saltando verificación');
          }
        }
      }
      
      console.log('ℹ️ No se encontraron livestreams activos');
      return null;

    } catch (error) {
      console.error('❌ Error detallado en API call:', error);
      throw error;
    }
  };

  // Función auxiliar OPTIMIZADA para verificar si un video específico está en vivo
  const quickVerifyVideoIsLive = async (videoId: string): Promise<boolean> => {
    try {
      // Solo verificar liveBroadcastContent con una llamada mínima
      const videoUrl = `https://www.googleapis.com/youtube/v3/videos?key=${STREAMING_URLS.youtubeApiKey}&id=${videoId}&part=snippet&fields=items(snippet/liveBroadcastContent)`;
      
      const response = await fetch(videoUrl);
      
      if (!response.ok) {
        console.warn(`⚠️ No se pudo verificar video ${videoId}: ${response.status}`);
        return false;
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const isLive = data.items[0].snippet.liveBroadcastContent === 'live';
        console.log(`🔍 Video ${videoId} - Status: ${data.items[0].snippet.liveBroadcastContent}`);
        return isLive;
      }
      
      return false;
    } catch (error) {
      console.warn(`⚠️ Error verificando video ${videoId}:`, error);
      return false;
    }
  };

  // Función para verificar si podemos usar la API
  const canUseAPI = (): boolean => {
    const now = Date.now();
    const hoursPassed = (now - LIVE_CHECK_CONFIG.lastAPIReset) / (1000 * 60 * 60);
    
    // Reset contador cada hora
    if (hoursPassed >= 1) {
      LIVE_CHECK_CONFIG.apiCallsCount = 0;
      LIVE_CHECK_CONFIG.lastAPIReset = now;
      setApiCallsRemaining(LIVE_CHECK_CONFIG.maxAPICallsPerHour);
    }
    
    const canUse = !useRSSOnly && LIVE_CHECK_CONFIG.apiCallsCount < LIVE_CHECK_CONFIG.maxAPICallsPerHour;
    
    if (!canUse && !useRSSOnly) {
      console.log('⚠️ Límite de API alcanzado por hora');
    }
    
    return canUse;
  };

  // Incrementar contador de API y actualizar estado
  const incrementAPICall = () => {
    LIVE_CHECK_CONFIG.apiCallsCount++;
    setApiCallsRemaining(LIVE_CHECK_CONFIG.maxAPICallsPerHour - LIVE_CHECK_CONFIG.apiCallsCount);
    setLastAPICall(new Date());
    console.log(`📊 API calls usadas: ${LIVE_CHECK_CONFIG.apiCallsCount}/${LIVE_CHECK_CONFIG.maxAPICallsPerHour}`);
  };

  // Función para actualización manual
  const handleManualUpdate = () => {
    if (manualUpdatesLeft > 0) {
      fetchAllChannelVideos(true, true); // forceUpdate=true, isManual=true
    }
  };

  // Función simple para verificar livestreams (wrapper de la optimizada)
  const checkForLiveStreams = async (): Promise<void> => {
    await checkForLiveStreamsAndReturn();
  };

  return {
    youtubeVideos,
    loadingYoutube,
    lastUpdateTime,
    manualUpdatesLeft,
    loadedPlaylists,
    playlistLoading,
    liveStream,
    checkingLive,
    apiCallsRemaining,
    lastAPICall,
    useRSSOnly,
    loadInitialData,
    updateManualCountDisplay,
    fetchLatestChannelVideos,
    handleManualUpdate,
    playYouTubeVideo,
    checkForLiveStreams,
    checkForLiveStreamsAndReturn,
    setLiveStream,
    setCheckingLive,
    setUseRSSOnly
  };
}; 