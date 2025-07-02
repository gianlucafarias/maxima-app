import TrackPlayer from 'react-native-track-player';

// Variable para evitar múltiples registros
let isServiceRegistered = false;

export const registerTrackPlayerService = () => {
  if (isServiceRegistered) return;

  try {
    TrackPlayer.registerPlaybackService(() => require('../service'));
    isServiceRegistered = true;
  } catch (error) {
    console.error('Error registrando servicio TrackPlayer:', error);
  }
};

// Auto-ejecutar el registro al importar este módulo
registerTrackPlayerService(); 