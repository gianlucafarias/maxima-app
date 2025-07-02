// Interfaz para los videos de YouTube con información de playlist
export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  publishedAt: string;
  duration: string;
  playlistName?: string;
  playlistColor?: string;
  isLive?: boolean; // Nueva propiedad para identificar livestreams
  liveViewers?: number; // Número de viewers en vivo (opcional)
}

// Interfaz para livestreams activos
export interface LiveStream {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  viewerCount?: number;
  isLive: boolean;
}

// Interfaz para noticias RSS
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category?: string;
  source: string;
}

// Configuración de fuentes de noticias
export interface NewsSource {
  name: string;
  rssUrl: string;
  category: string;
  color: string;
}

// Interfaz para propiedades del componente LazyPlaylistSection
export interface LazyPlaylistSectionProps {
  playlist: PlaylistConfig;
  videos: YouTubeVideo[];
  isLoaded: boolean;
  isLoading: boolean;
  onLoad: () => void;
  onVideoPress: (videoId: string) => void;
  formatDate: (dateString: string) => string;
  scrollY: number;
}

// Interfaz para configuración de playlist
export interface PlaylistConfig {
  id: string;
  name: string;
  schedule: string;
  icon: string;
  color: string;
} 