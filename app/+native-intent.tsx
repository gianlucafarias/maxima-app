// +native-intent.tsx - Manejo de deep links de TrackPlayer sin interferir con expo-router

export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    console.log('🔗 Deep link recibido:', path, 'inicial:', initial);
    
    // Manejar deep links de TrackPlayer
    if (path.includes('trackplayer://') || path.includes('trackplayer:')) {
      console.log('🎵 Deep link de TrackPlayer detectado');
      
      // Verificar los diferentes tipos de deep links de TrackPlayer
      if (path.includes('notification.click') || 
          path.includes('notification') ||
          path === 'trackplayer://notification.click') {
        
        console.log('🔔 Click en notificación de TrackPlayer - abriendo app');
        
        // En lugar de navegar, solo traer la app al foreground
        // El estado de reproducción ya está manejado por TrackPlayer
        return '/'; // Redirigir al home/index
      }
    }
    
    // Manejar deep links del scheme de la app
    if (path.includes('la-max-955-app://')) {
      console.log('📱 Deep link de la app detectado');
      
      // Extraer la ruta después del scheme
      const cleanPath = path.replace('la-max-955-app://', '');
      
      if (cleanPath === '' || cleanPath === '/') {
        return '/'; // Home
      }
      
      // Convertir a ruta válida
      return `/${cleanPath}`;
    }
    
    // Para todos los demás casos, devolver la ruta original
    return path;
    
  } catch (error) {
    console.error('❌ Error procesando deep link:', error);
    // En caso de error, redirigir al home de forma segura
    return '/';
  }
} 