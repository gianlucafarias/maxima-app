import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export interface YouTubeVideo {
  id: string;
  title: string;
  link: string;
  thumbnail: string;
  publishDate: string;
  creator: string;
}

const RSS_URL = 'https://fetchrss.com/feed/aGW_KQCYrq9DaGW_FDJ_Lv0y.rss';
const CACHE_KEY = 'youtube_rss_videos';
const CACHE_TIMESTAMP_KEY = 'youtube_rss_timestamp';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos en milisegundos

export const useYouTubeRSS = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Función para extraer el video ID del enlace de YouTube
  const extractVideoId = (link: string): string => {
    if (!link) {
      console.warn('⚠️ Link vacío para extraer video ID');
      return '';
    }

    try {
      // Patrones para diferentes formatos de URL de YouTube
      const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/, // youtube.com/watch?v=ID
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/, // youtu.be/ID
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/, // youtube.com/embed/ID
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/, // youtube.com/v/ID
        /[?&]v=([a-zA-Z0-9_-]{11})/, // Cualquier URL con ?v= o &v=
      ];

      for (const pattern of patterns) {
        const match = link.match(pattern);
        if (match && match[1]) {
          const videoId = match[1];
          
          
          // Validar que el ID tenga exactamente 11 caracteres
          if (videoId.length === 11) {
            return videoId;
          } else {
            console.warn(`⚠️ Video ID inválido (longitud ${videoId.length}): ${videoId}`);
          }
        }
      }

      console.warn(`⚠️ No se pudo extraer video ID de: ${link}`);
      return '';
      
    } catch (error) {
      console.error('❌ Error extrayendo video ID:', error);
      return '';
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const minutes = Math.floor(diffInHours * 60);
        return `Hace ${minutes} min`;
      } else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `Hace ${hours}h`;
      } else {
        const days = Math.floor(diffInHours / 24);
        return `Hace ${days}d`;
      }
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  // Función para parsear el RSS XML
  const parseRSSXML = (xmlText: string): YouTubeVideo[] => {
    const videos: YouTubeVideo[] = [];

    try {
      
      // Buscar todos los items
      const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g);
      
      if (itemMatches) {
        itemMatches.forEach((item, index) => {
          try {
            
            // Extraer título
            const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || 
                              item.match(/<title>(.*?)<\/title>/);
            const title = titleMatch ? titleMatch[1].trim() : `Video ${index + 1}`;
            

            // Extraer enlace - mejorar la extracción
            const linkMatch = item.match(/<link>(.*?)<\/link>/);
            let link = linkMatch ? linkMatch[1].trim() : '';
            

            // Verificar si el link es válido de YouTube
            if (!link.includes('youtube.com') && !link.includes('youtu.be')) {
              console.warn(`⚠️ Link no válido para YouTube: ${link}`);
              return; // Skip este item
            }

            // Limpiar la URL si tiene caracteres extraños
            link = link.replace(/&amp;/g, '&').trim();

            // Extraer thumbnail de media:content
            const thumbnailMatch = item.match(/<media:content url="(.*?)" medium="image"/);
            let thumbnail = thumbnailMatch ? thumbnailMatch[1] : '';

            // Extraer fecha de publicación
            const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
            const publishDate = pubDateMatch ? pubDateMatch[1].trim() : '';

            // Extraer creador
            const creatorMatch = item.match(/<dc:creator><!\[CDATA\[(.*?)\]\]><\/dc:creator>/) ||
                               item.match(/<dc:creator>(.*?)<\/dc:creator>/);
            const creator = creatorMatch ? creatorMatch[1].trim() : 'La MAX Stream Radio 95.5';

            // Extraer video ID del link
            const videoId = extractVideoId(link);

            if (!videoId) {
              console.warn(`⚠️ No se pudo extraer video ID de: ${link}`);
              return; // Skip este item
            }

            // Generar thumbnail si no existe
            if (!thumbnail) {
              thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            }

            const video = {
              id: videoId,
              title,
              link,
              thumbnail,
              publishDate: formatDate(publishDate),
              creator
            };



            videos.push(video);

          } catch (itemError) {
            console.warn(`❌ Error parseando item ${index + 1}:`, itemError);
          }
        });
      }

      
    } catch (error) {
      console.error('❌ Error parseando RSS XML:', error);
    }

    return videos.slice(0, 5); // Máximo 5 videos
  };

  // Función para cargar desde caché
  const loadFromCache = async (): Promise<{ videos: YouTubeVideo[], timestamp: number } | null> => {
    try {
      const cachedVideos = await AsyncStorage.getItem(CACHE_KEY);
      const cachedTimestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedVideos && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const now = Date.now();

        // Verificar si el caché aún es válido
        if (now - timestamp < CACHE_DURATION) {
          return {
            videos: JSON.parse(cachedVideos),
            timestamp
          };
        }
      }
    } catch (error) {
      console.warn('⚠️ Error cargando caché de videos RSS:', error);
    }

    return null;
  };

  // Función para guardar en caché
  const saveToCache = async (videos: YouTubeVideo[]): Promise<void> => {
    try {
      const timestamp = Date.now();
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(videos));
      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
    } catch (error) {
      console.warn('⚠️ Error guardando caché de videos RSS:', error);
    }
  };

  // Función para obtener videos desde RSS
  const fetchVideos = async (forceRefresh: boolean = false): Promise<void> => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // Intentar cargar desde caché primero (si no es refresh forzado)
      if (!forceRefresh) {
        const cached = await loadFromCache();
        if (cached) {
          setVideos(cached.videos);
          setLastUpdate(new Date(cached.timestamp));
          setLoading(false);
          return;
        }
      }

      const response = await fetch(RSS_URL);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const xmlText = await response.text();
      const parsedVideos = parseRSSXML(xmlText);

      if (parsedVideos.length > 0) {
        setVideos(parsedVideos);
        await saveToCache(parsedVideos);
        setLastUpdate(new Date());
      } else {
        throw new Error('No se encontraron videos en el RSS');
      }

    } catch (error) {
      console.error('❌ Error fetching videos RSS:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      
      // En caso de error, intentar cargar desde caché
      const cached = await loadFromCache();
      if (cached) {
        setVideos(cached.videos);
        setLastUpdate(new Date(cached.timestamp));
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar videos al inicializar
  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    loading,
    error,
    lastUpdate,
    fetchVideos,
    refreshVideos: () => fetchVideos(true)
  };
}; 