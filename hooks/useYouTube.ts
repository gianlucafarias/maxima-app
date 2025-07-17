import { LIVE_CHECK_CONFIG, STREAMING_URLS } from '@/config/constants';
import { LiveStream } from '@/types/youtube';
import { useState } from 'react';

export const useYouTube = () => {
  const [liveStream, setLiveStream] = useState<LiveStream | null>(null);
  const [checkingLive, setCheckingLive] = useState(false);
  const [lastLiveCheck, setLastLiveCheck] = useState<Date | null>(null);
  const [cachedLiveResult, setCachedLiveResult] = useState<any>(null);
  const [manualUpdatesLeft, setManualUpdatesLeft] = useState<number>(5);
  const [apiCallsRemaining, setApiCallsRemaining] = useState(LIVE_CHECK_CONFIG.maxAPICallsPerHour);
  const [useRSSOnly, setUseRSSOnly] = useState(false);

  // Función simple para actualizar contador de actualizaciones
  const updateManualCountDisplay = async () => {
    // Implementación simplificada
    setManualUpdatesLeft(5);
  };

  // Función simple para cargar datos iniciales (solo placeholder)
  const loadInitialData = async (): Promise<void> => {
    // Solo para compatibilidad, no hace nada crítico
    console.log('🔄 Carga inicial completada');
  };

  // Verificar si podemos usar caché
  const canUseLiveCache = (): boolean => {
    if (!lastLiveCheck || !cachedLiveResult) return false;
    
    const now = new Date();
    const minutesSinceLastCheck = (now.getTime() - lastLiveCheck.getTime()) / (1000 * 60);
    
    return minutesSinceLastCheck < LIVE_CHECK_CONFIG.cacheMinutes;
  };

  // Método principal usando RSS feed (sin límites de API)
  const checkLiveStreamViaRSS = async (): Promise<any> => {
    try {
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${STREAMING_URLS.youtubeChannelId}`;
      console.log('🔍 Verificando RSS de YouTube...');
      
      const response = await fetch(rssUrl);
      if (!response.ok) {
        throw new Error(`RSS Error: ${response.status}`);
      }
      
      const xmlText = await response.text();
      console.log('✅ RSS obtenido correctamente, parseando videos...');
      
      const videoMatches = xmlText.match(/<entry>[\s\S]*?<\/entry>/g);
      
      if (videoMatches && videoMatches.length > 0) {
        console.log(`📹 Encontrados ${videoMatches.length} videos en RSS, revisando los 3 más recientes...`);
        
        // Revisar los 3 videos más recientes
        for (let i = 0; i < Math.min(3, videoMatches.length); i++) {
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
            
            const liveKeywords = [
              'live', 'directo', 'vivo', 'transmisión', 'streaming', 
              'en vivo', 'ahora', 'radio', 'programa', 'show',
              'máxima', 'fm', 'emisión', 'aire', 'stream', 'bunker'
            ];
            const titleLower = title.toLowerCase();
            const hasLiveKeywords = liveKeywords.some(keyword => titleLower.includes(keyword));
            
            console.log(`📺 Video ${i + 1}: "${title}"`);
            console.log(`⏰ Publicado hace ${hoursAgo.toFixed(1)} horas`);
            console.log(`🏷️ Tiene keywords de live: ${hasLiveKeywords}`);
            
            // Hasta 24 horas o cualquier keyword
            if (hoursAgo <= 24 || hasLiveKeywords) {
              console.log('✅ LIVESTREAM DETECTADO via RSS:', title);
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
        
        console.log('ℹ️ No se detectaron livestreams en los videos más recientes');
      } else {
        console.log('ℹ️ No se encontraron videos en el RSS');
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error con RSS:', error);
      return null;
    }
  };

  // Verificación via API (con cuota) - RESTAURADA
  const checkLiveStreamViaAPI = async (): Promise<any> => {
    // Verificar que tengamos API key
    if (!STREAMING_URLS.youtubeApiKey) {
      console.warn('⚠️ YouTube API Key no configurada - usando solo RSS');
      setUseRSSOnly(true);
      return null;
    }

    if (!STREAMING_URLS.youtubeChannelId) {
      console.warn('⚠️ YouTube Channel ID no configurado - usando solo RSS');
      setUseRSSOnly(true);
      return null;
    }

    console.log('🔑 YouTube API configurada correctamente');

    try {
      // MÉTODO 1: Buscar livestreams directamente (más eficiente)
      const liveSearchUrl = `https://www.googleapis.com/youtube/v3/search?key=${STREAMING_URLS.youtubeApiKey}&channelId=${STREAMING_URLS.youtubeChannelId}&part=snippet&eventType=live&type=video&maxResults=1`;
      
      const liveResponse = await fetch(liveSearchUrl);
      
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        
        if (liveData.items && liveData.items.length > 0) {
          const liveVideo = liveData.items[0];
          
          return {
            videoId: liveVideo.id.videoId,
            title: liveVideo.snippet.title,
            thumbnail: liveVideo.snippet.thumbnails.medium?.url || liveVideo.snippet.thumbnails.default?.url,
            channelTitle: liveVideo.snippet.channelTitle,
            isLive: true
          };
        } else {
          return null;
        }
      }
      
      // MÉTODO 2: Fallback - buscar videos recientes
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${STREAMING_URLS.youtubeApiKey}&channelId=${STREAMING_URLS.youtubeChannelId}&part=snippet&type=video&order=date&maxResults=2`;
      
      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        if (searchResponse.status === 403) {
          console.warn('🚨 Error 403: Cuota excedida');
          setUseRSSOnly(true);
          throw new Error('API quota exceeded');
        }
        throw new Error(`API Error: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      
      if (searchData.error) {
        if (searchData.error.code === 403) {
          setUseRSSOnly(true);
          throw new Error('API quota exceeded');
        }
        throw new Error(`YouTube API Error: ${searchData.error.message}`);
      }

      if (searchData.items && searchData.items.length > 0) {
        // Verificar videos recientes con keywords
        for (const video of searchData.items) {
          const title = video.snippet.title.toLowerCase();
          const liveKeywords = [
            'live', 'en vivo', 'directo', 'streaming', 'transmisión',
            'radio', 'programa', 'show', 'máxima', 'fm', 'emisión'
          ];
          const hasLiveKeywords = liveKeywords.some(keyword => title.includes(keyword));
          
          if (hasLiveKeywords) {
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
          } 
        }
      }
      
      return null;

    } catch (error) {
      console.error('❌ Error detallado en API call:', error);
      throw error;
    }
  };

  // Función auxiliar para verificar si un video específico está en vivo - RESTAURADA
  const quickVerifyVideoIsLive = async (videoId: string): Promise<boolean> => {
    try {
      const videoUrl = `https://www.googleapis.com/youtube/v3/videos?key=${STREAMING_URLS.youtubeApiKey}&id=${videoId}&part=snippet&fields=items(snippet/liveBroadcastContent)`;
      
      const response = await fetch(videoUrl);
      
      if (!response.ok) {
        console.warn(`⚠️ No se pudo verificar video ${videoId}: ${response.status}`);
        return false;
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const isLive = data.items[0].snippet.liveBroadcastContent === 'live';
        return isLive;
      }
      
      return false;
    } catch (error) {
      console.warn(`⚠️ Error verificando video ${videoId}:`, error);
      return false;
    }
  };

  // Función para verificar si podemos usar la API - RESTAURADA
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
    return canUse;
  };

  // Incrementar contador de API - RESTAURADA
  const incrementAPICall = () => {
    LIVE_CHECK_CONFIG.apiCallsCount++;
    setApiCallsRemaining(LIVE_CHECK_CONFIG.maxAPICallsPerHour - LIVE_CHECK_CONFIG.apiCallsCount);
  };

  // Función principal para verificar livestreams
  const checkForLiveStreamsAndReturn = async (): Promise<any> => {
    if (checkingLive) {
      console.log('🔄 Ya hay una verificación de livestreams en progreso...');
      return liveStream;
    }
    
    console.log('🚀 INICIANDO verificación de livestreams...');
    setCheckingLive(true);
    
    try {
      // Usar caché si es reciente
      if (canUseLiveCache()) {
        console.log('💾 Usando resultado desde caché...');
        setLiveStream(cachedLiveResult);
        setCheckingLive(false);
        return cachedLiveResult;
      }

      // 🚀 MÉTODO PRINCIPAL: API de YouTube (única forma real de detectar livestreams)
      console.log('🔑 Verificando livestreams via API de YouTube (método principal)...');
      if (canUseAPI()) {
        console.log('✅ API disponible, haciendo verificación via API...');
        incrementAPICall();
        
        const apiResult = await checkLiveStreamViaAPI();
        
        // Cachear resultado (incluso si es null)
        setCachedLiveResult(apiResult);
        setLastLiveCheck(new Date());
        
        if (apiResult) {
          console.log('✅ LIVESTREAM ENCONTRADO via API!');
          setLiveStream(apiResult);
          return apiResult;
        } else {
          console.log('ℹ️ API confirmó: No hay livestreams activos - mostrando Twitch');
          setLiveStream(null);
          return null;
        }
      } else {
        console.log('❌ API no disponible (cuota agotada) - mostrando Twitch por defecto');
        setLiveStream(null);
        setCachedLiveResult(null);
        setLastLiveCheck(new Date());
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error verificando livestreams:', error);
      setLiveStream(null);
      return null;
    } finally {
      setCheckingLive(false);
      console.log('🏁 Verificación de livestreams completada');
    }
  };

  // Función simple para verificar livestreams
  const checkForLiveStreams = async (): Promise<void> => {
    await checkForLiveStreamsAndReturn();
  };

  return {
    liveStream,
    checkingLive,
    apiCallsRemaining,
    useRSSOnly,
    loadInitialData,
    updateManualCountDisplay,
    checkForLiveStreams,
    checkForLiveStreamsAndReturn,
    setLiveStream,
    setUseRSSOnly,
  };
}; 