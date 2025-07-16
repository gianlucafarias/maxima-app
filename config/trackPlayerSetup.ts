import TrackPlayer from 'react-native-track-player';

// Variable para evitar múltiples registros
let isServiceRegistered = false;

export const registerTrackPlayerService = () => {
  if (isServiceRegistered) {
    console.log('🔧 Servicio TrackPlayer ya está registrado');
    return;
  }

  try {
    console.log('🔧 Registrando servicio TrackPlayer...');
    TrackPlayer.registerPlaybackService(() => require('../service'));
    isServiceRegistered = true;
    console.log('✅ Servicio TrackPlayer registrado exitosamente');
  } catch (error) {
    console.error('❌ Error registrando servicio TrackPlayer:', error);
  }
};

// Función para verificar si el servicio está registrado
export const isTrackPlayerServiceRegistered = () => {
  return isServiceRegistered;
};

// Auto-ejecutar el registro al importar este módulo
console.log('📦 Importando trackPlayerSetup.ts...');
registerTrackPlayerService(); 