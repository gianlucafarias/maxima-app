import { NewsItem } from '@/types/youtube';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const NEWS_RSS_URLS = [
  'https://ceresciudad.com/feed/',
  'https://api.allorigins.win/get?url=https%3A//ceresciudad.com/feed/',
];

const CACHE_KEY = 'ceres_news_cache';
const TIMESTAMP_KEY = 'ceres_news_timestamp';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Función para parsear el RSS XML
  const parseRSSXML = (xmlText: string): NewsItem[] => {
    try {
      const items: NewsItem[] = [];
      
      // Extraer todos los items del RSS
      const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g);
      
      if (itemMatches) {
        itemMatches.forEach((item, index) => {
          // Extraer título
          const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || 
                           item.match(/<title>(.*?)<\/title>/);
          const title = titleMatch ? titleMatch[1] : '';
          
          // Extraer enlace
          const linkMatch = item.match(/<link>(.*?)<\/link>/);
          const link = linkMatch ? linkMatch[1] : '';
          
          // Extraer descripción
          const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
                           item.match(/<description>(.*?)<\/description>/);
          let description = descMatch ? descMatch[1] : '';
          
          // Limpiar HTML de la descripción y extraer solo el texto
          description = description
            .replace(/<[^>]*>/g, '') // Remover todas las etiquetas HTML
            .replace(/\[&#8230;\]/g, '...') // Reemplazar entidades HTML
            .replace(/La entrada.*se publicó primero en.*/, '') // Remover texto de pie
            .trim();
          
          // Limitar descripción a 150 caracteres
          if (description.length > 150) {
            description = description.substring(0, 150) + '...';
          }
          
          // Extraer fecha
          const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
          const pubDate = dateMatch ? dateMatch[1] : '';
          
          // Extraer categoría
          const categoryMatch = item.match(/<category><!\[CDATA\[(.*?)\]\]><\/category>/) ||
                               item.match(/<category>(.*?)<\/category>/);
          const category = categoryMatch ? categoryMatch[1] : 'General';
          
          // Extraer autor
          const authorMatch = item.match(/<dc:creator><!\[CDATA\[(.*?)\]\]><\/dc:creator>/) ||
                             item.match(/<dc:creator>(.*?)<\/dc:creator>/);
          const author = authorMatch ? authorMatch[1] : 'Ceres Ciudad';
          
          if (title && link) {
            items.push({
              id: `ceres_${index}_${Date.now()}`,
              title,
              description,
              link,
              pubDate,
              category,
              source: 'Ceres Ciudad'
            });
          }
        });
      }
      
      // Ordenar poniendo "Portada" primero
      const sortedItems = items.sort((a, b) => {
        // Si a es Portada y b no, a va primero
        if (a.category?.toLowerCase() === 'portada' && b.category?.toLowerCase() !== 'portada') {
          return -1;
        }
        // Si b es Portada y a no, b va primero
        if (b.category?.toLowerCase() === 'portada' && a.category?.toLowerCase() !== 'portada') {
          return 1;
        }
        // Si ambos son Portada o ninguno es Portada, mantener orden original (por fecha)
        return 0;
      });
      
      return sortedItems.slice(0, 10); // Mostrar solo las 10 más recientes
    } catch (error) {
      console.error('❌ Error parseando RSS:', error);
      return [];
    }
  };

  // Función para cargar noticias desde caché
  const loadFromCache = async (): Promise<NewsItem[]> => {
    try {
      const cachedNews = await AsyncStorage.getItem(CACHE_KEY);
      const timestamp = await AsyncStorage.getItem(TIMESTAMP_KEY);
      
      if (cachedNews && timestamp) {
        const cacheAge = Date.now() - parseInt(timestamp);
        if (cacheAge < CACHE_DURATION) {
          const parsedNews = JSON.parse(cachedNews);
          setLastUpdate(new Date(parseInt(timestamp)).toLocaleTimeString());
          return parsedNews;
        }
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error cargando caché de noticias:', error);
      return [];
    }
  };

  // Función para guardar en caché
  const saveToCache = async (newsItems: NewsItem[]) => {
    try {
      const timestamp = Date.now().toString();
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newsItems));
      await AsyncStorage.setItem(TIMESTAMP_KEY, timestamp);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('❌ Error guardando caché de noticias:', error);
    }
  };

  // Función para obtener noticias del RSS
  const fetchNews = async (forceRefresh = false) => {
    // Si no es actualización forzada, intentar cargar desde caché primero
    if (!forceRefresh) {
      const cachedNews = await loadFromCache();
      if (cachedNews.length > 0) {
        setNews(cachedNews);
        return;
      }
    }

    setLoading(true);
    
    // Probar múltiples URLs
    for (let i = 0; i < NEWS_RSS_URLS.length; i++) {
      const currentUrl = NEWS_RSS_URLS[i];
      
      try {
        const response = await fetch(currentUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }
        
        let xmlText = await response.text();
        
        // Si estamos usando allorigins, extraer el contenido
        if (currentUrl.includes('allorigins.win')) {
          try {
            const jsonResponse = JSON.parse(xmlText);
            xmlText = jsonResponse.contents;
          } catch (e) {
            continue;
          }
        }
        
        const parsedNews = parseRSSXML(xmlText);
        
        if (parsedNews.length > 0) {
          setNews(parsedNews);
          await saveToCache(parsedNews);
          setLoading(false);
          return; // Éxito, salir del bucle
        }
        
      } catch (error) {
        // Si es el último intento, cargar desde caché
        if (i === NEWS_RSS_URLS.length - 1) {
          const cachedNews = await loadFromCache();
          if (cachedNews.length > 0) {
            setNews(cachedNews);
          }
        }
      }
    }
    
    setLoading(false);
  };

  // Cargar noticias iniciales
  useEffect(() => {
    fetchNews();
  }, []);

  // Función para actualización manual
  const refreshNews = () => {
    fetchNews(true);
  };

  return {
    news,
    loading,
    lastUpdate,
    refreshNews,
    fetchNews
  };
}; 