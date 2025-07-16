// service.js - Servicio de TrackPlayer para controles nativos
import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function() {
  console.log('🔧 Inicializando servicio de TrackPlayer...');
  
  // Manejar eventos de reproductor remoto
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    console.log('▶️ RemotePlay event triggered');
    try {
      const queue = await TrackPlayer.getQueue();
      if (queue.length === 0) {
        console.log('❌ No hay tracks en la cola');
        return;
      }
      await TrackPlayer.play();
      console.log('✅ Reproducción iniciada desde control remoto');
    } catch (error) {
      console.error('❌ Error en RemotePlay:', error);
    }
  });
  
  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    console.log('⏸️ RemotePause event triggered');
    try {
      await TrackPlayer.pause();
      console.log('✅ Pausado desde control remoto');
    } catch (error) {
      console.error('❌ Error en RemotePause:', error);
    }
  });
  
  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    console.log('⏹️ RemoteStop event triggered');
    try {
      await TrackPlayer.stop();
      // NO hacer reset para preservar la cola de reproducción
      // await TrackPlayer.reset();
      console.log('✅ Detenido desde control remoto (cola preservada)');
    } catch (error) {
      console.error('❌ Error en RemoteStop:', error);
    }
  });

  // Manejar cuando se descarta la notificación deslizándola
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async () => {
    console.log('🔔 Notificación posiblemente descartada (JumpBackward)');
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
    } catch (error) {
      console.error('❌ Error manejando descarte de notificación:', error);
    }
  });

  // Manejar cuando se cierra/quita la notificación por duck
  TrackPlayer.addEventListener(Event.RemoteDuck, async () => {
    console.log('🔇 RemoteDuck event triggered');
    try {
      await TrackPlayer.pause();
    } catch (error) {
      console.error('❌ Error en RemoteDuck:', error);
    }
  });

  // Manejar cuando la app se mata - detener todo
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
    console.log('📋 PlaybackQueueEnded event triggered');
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
    } catch (error) {
      console.error('❌ Error en PlaybackQueueEnded:', error);
    }
  });

  // Manejar errores de reproducción
  TrackPlayer.addEventListener(Event.PlaybackError, async (event) => {
    console.log('❌ PlaybackError event triggered:', event);
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
    } catch (error) {
      console.error('❌ Error manejando PlaybackError:', error);
    }
  });

  console.log('✅ Servicio de TrackPlayer inicializado correctamente');
}; 