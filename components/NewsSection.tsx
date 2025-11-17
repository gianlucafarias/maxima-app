import { TVTouchable } from '@/components/TVTouchable';
import { NewsItem } from '@/types/youtube';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

interface NewsSectionProps {
  news: NewsItem[];
  loading: boolean;
  lastUpdate: string;
  onRefresh: () => void;
}

const NewsSection: React.FC<NewsSectionProps> = ({
  news,
  loading,
  lastUpdate,
  onRefresh
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const cardRefs = useRef<{ [key: number]: View | null }>({});

  // No mostrar la sección si no hay noticias y no está cargando
  if (!loading && news.length === 0) {
    return null;
  }

  // Función para hacer scroll cuando un elemento recibe foco
  const handleCardFocus = (index: number) => {
    if (!Platform.isTV || !scrollViewRef.current) return;
    
    const cardRef = cardRefs.current[index];
    if (!cardRef) return;

    // Usar measure para obtener la posición del elemento
    cardRef.measureLayout(
      scrollViewRef.current as any,
      (x, y, width, height) => {
        // Hacer scroll para centrar el elemento en la vista
        const scrollX = Math.max(0, x - 100); // 100px de padding desde el borde izquierdo
        scrollViewRef.current?.scrollTo({ x: scrollX, animated: true });
      },
      () => {
        // Si falla measureLayout, intentar con scroll basado en índice
        const cardWidth = 260 + 15; // width + marginRight
        const scrollX = Math.max(0, index * cardWidth - 100);
        scrollViewRef.current?.scrollTo({ x: scrollX, animated: true });
      }
    );
  };

  const openNewsLink = async (url: string, title: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se puede abrir el enlace');
      }
    } catch (error) {
      console.error('Error abriendo enlace:', error);
      Alert.alert('Error', 'No se pudo abrir la noticia');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 60) {
        return `Hace ${diffMinutes} min`;
      } else if (diffHours < 24) {
        return `Hace ${diffHours}h`;
      } else {
        return date.toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit'
        });
      }
    } catch {
      return 'Reciente';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'deportes': return '#e74c3c';
      case 'política': case 'politica': return '#3498db';
      case 'generales': return '#2ecc71';
      case 'portada': return '#f39c12';
      default: return '#6c5ce7';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header de la sección */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="newspaper-outline" size={24} color="#a29bfe" />
          <Text style={styles.sectionTitle}>Últimas Noticias</Text>
           
    
        </View>
        
        <TVTouchable 
          id="news-refresh"
          style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}
          onPress={onRefresh}
          disabled={loading}
        >
          <Ionicons 
            name={loading ? "hourglass" : "refresh-outline"} 
            size={20} 
            color={loading ? "#666" : "#a29bfe"} 
          />
        </TVTouchable>
        
      </View>
<Text style={styles.lastUpdateText}>
          CeresCiudad.com
        </Text>
     
      

      {/* Loading indicator */}
      {loading && news.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a29bfe" />
          <Text style={styles.loadingText}>Cargando noticias...</Text>
        </View>
      ) : null}

      {/* Lista de noticias */}
      {news.length > 0 ? (
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.newsScroll}
          contentContainerStyle={styles.newsScrollContent}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        >
          {news.map((item, index) => (
            <View
              key={item.id}
              ref={(ref) => { cardRefs.current[index] = ref; }}
              collapsable={false}
            >
              <TVTouchable
                id={`news-${index}`}
                style={styles.newsCard}
                onPress={() => openNewsLink(item.link, item.title)}
                onFocus={() => handleCardFocus(index)}
              >
              <LinearGradient
                colors={['rgba(108, 92, 231, 0.15)', 'rgba(162, 155, 254, 0.05)']}
                style={styles.cardGradient}
              >
                {/* Header de la card con categoría y fecha */}
                <View style={styles.cardHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category || '') }]}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                  <Text style={styles.dateText}>{formatDate(item.pubDate)}</Text>
                </View>

                {/* Contenido principal */}
                <View style={styles.cardContent}>
                  {/* Título de la noticia */}
                  <Text style={styles.newsTitle} numberOfLines={4}>
                    {item.title}
                  </Text>

                  {/* Descripción */}
                  <Text style={styles.newsDescription} numberOfLines={3}>
                    {item.description}
                  </Text>
                </View>

                {/* Footer con fuente */}
                <View style={styles.cardFooter}>
                  <Text style={styles.sourceText}>{item.source}</Text>
                  <Ionicons name="open-outline" size={16} color="#a29bfe" />
                </View>
              </LinearGradient>
            </TVTouchable>
            </View>
          ))}
        </ScrollView>
      ) : null}

      {/* Estado vacío */}
      {!loading && news.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="newspaper-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>No hay noticias disponibles</Text>
          <TVTouchable id="news-retry" style={styles.retryButton} onPress={onRefresh}>
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
    color: 'white',
    marginLeft: 8,
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#a29bfe',
    textAlign: 'left',
    marginBottom: 15,
    marginLeft: 50,
    opacity: 0.8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    marginTop: 10,
    opacity: 0.8,
  },
  newsScroll: {
    paddingLeft: 20,
  },
  newsScrollContent: {
    paddingRight: 20,
  },
  newsCard: {
    width: 260,
    marginRight: 15,
    height: 200,
  },
  cardGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(162, 155, 254, 0.2)',
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  dateText: {
    fontSize: 11,
    color: '#a29bfe',
    opacity: 0.8,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    lineHeight: 20,
  },
  newsDescription: {
    fontSize: 13,
    color: 'white',
    opacity: 0.8,
    lineHeight: 18,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 12,
    color: '#a29bfe',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(162, 155, 254, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    fontSize: 14,
    color: '#a29bfe',
    fontWeight: '600',
  },
});

export default NewsSection; 