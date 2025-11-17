// +native-intent.tsx - Manejo de deep links de TrackPlayer sin interferir con expo-router

export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    console.log('🔗 Deep link recibido:', path, 'inicial:', initial);
    
    // IMPORTANTE: No procesar URLs de desarrollo de Expo
    if (path.includes('exp+expo-development-client') || 
        path.includes('exp://') || 
        path.includes('exps://') ||
        path.includes('////exp+')) {
      console.log('🛠️ URL de desarrollo de Expo - no procesando');
      return path; // Devolver tal como está para que Expo lo maneje
    }
    
    // Manejar deep links de TrackPlayer solamente si son URLs válidas
    if (path.startsWith('trackplayer://')) {
      console.log('🎵 Deep link de TrackPlayer detectado');
      
      // Verificar los diferentes tipos de deep links de TrackPlayer
      if (path.includes('notification.click') || 
          path.includes('notification')) {
        
        console.log('🔔 Click en notificación de TrackPlayer - abriendo app');
        return '/'; // Redirigir al home/index
      }
    }
    
    // Manejar deep links del scheme de la app SOLAMENTE si empiezan correctamente
    if (path.startsWith('la-max-955-app://') && !path.includes('////')) {
      console.log('📱 Deep link válido de la app detectado');
      
      // Extraer la ruta después del scheme
      const cleanPath = path.replace('la-max-955-app://', '');
      
      if (cleanPath === '' || cleanPath === '/') {
        return '/'; // Home
      }
      
      // Asegurar que empiece con /
      const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
      console.log('🔗 Redirigiendo a:', finalPath);
      return finalPath;
    }
    
    // Para todos los demás casos, devolver la ruta original sin modificar
    console.log('🔗 Devolviendo ruta sin modificar:', path);
    return path;
    
  } catch (error) {
    console.error('❌ Error procesando deep link:', error);
    // En caso de error, devolver la ruta original para mayor seguridad
    return path;
  }
} 