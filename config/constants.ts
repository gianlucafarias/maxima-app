import { PlaylistConfig } from '@/types/youtube';

// Configuración de playlists principales
export const MAIN_PLAYLISTS: PlaylistConfig[] = [
  {
    id: 'PLTAyxPXZeJYyIxsZCpCM3QbKamQ8wQwlB',
    name: 'Bunker Radio de Mañana',
    schedule: 'Lun a Vie desde las 9 AM',
    icon: 'sunny-outline',
    color: '#ff6b6b'
  },
  {
    id: 'PLTAyxPXZeJYyyz4o1CH_EkxxFPS_e60LJ',
    name: 'El Tapón Deportivo',
    schedule: 'Lun a Vie 13 hs',
    icon: 'football-outline',
    color: '#4ecdc4'
  },
  {
    id: 'PLTAyxPXZeJYwCpD4ksYins8orQWc6onI6',
    name: 'Fútbol en vivo',
    schedule: 'Liga Ceresina de Fútbol',
    icon: 'trophy-outline',
    color: '#45b7d1'
  }
];

// Configuración de cache y horarios
export const CACHE_CONFIG = {
  updateTimes: ['12:00', '16:00'], // 12:00 PM y 4:00 PM
  cacheKey: 'youtube_playlists_cache',
  lastUpdateKey: 'youtube_last_update',
  manualCountKey: 'youtube_manual_count',
  maxCacheAge: 4 * 60 * 60 * 1000, // 4 horas en milisegundos
  maxManualUpdates: 5, // Límite de actualizaciones manuales por día
};

// Configuración optimizada para conservar cuota de API
export const LIVE_CHECK_CONFIG = {
  useRSSFirst: true, // Priorizar RSS sobre API (sin cuota)
  intervalMinutes: 10, // Verificar cada 10 minutos (era 5) - menos frecuente
  maxAPICallsPerHour: 6, // Aumentado de 2 a 6 para el nuevo método optimizado
  cacheAPIResults: true, // Cachear resultados de API
  apiCallsCount: 0, // Contador de llamadas por hora
  lastAPIReset: Date.now(), // Último reset del contador
  cacheMinutes: 5, // Cachear resultados por 5 minutos para evitar llamadas duplicadas
};

// URLs de streamings
export const STREAMING_URLS = {
  radioStream: process.env.EXPO_PUBLIC_RADIO_STREAM || 'https://emisora.radiosplay.com.ar/8014/stream/',
  twitchChannel: process.env.EXPO_PUBLIC_TWITCH_CHANNEL || 'lamaxmaxima',
  youtubeChannelId: process.env.EXPO_PUBLIC_YOUTUBE_CHANNEL_ID || 'UCBy5F5apvBB_Yp4Vcbwkipw',
  youtubeApiKey: process.env.EXPO_PUBLIC_YOUTUBE_API_KEY
};

// Configuración de fuentes de noticias RSS
export const NEWS_SOURCES = [
  {
    name: 'Clarín',
    rssUrl: 'https://www.clarin.com/rss/lo-ultimo/',
    category: 'General',
    color: '#e74c3c'
  },
  {
    name: 'La Nación',
    rssUrl: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/',
    category: 'General', 
    color: '#3498db'
  },
  {
    name: 'Infobae',
    rssUrl: 'https://www.infobae.com/feeds/rss/',
    category: 'General',
    color: '#f39c12'
  }
];

// Configuración de caché para noticias
export const NEWS_CACHE_CONFIG = {
  updateIntervalMinutes: 30, // Actualizar cada 30 minutos
  maxNewsItems: 20, // Máximo de noticias a mostrar
  cacheKey: 'news_cache',
  timestampKey: 'news_last_update'
}; 