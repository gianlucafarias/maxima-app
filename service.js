// service.js - Servicio de TrackPlayer para controles nativos
import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function() {
  
  // Manejar eventos de reproductor remoto
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    const queue = await TrackPlayer.getQueue();
    if (queue.length === 0) return;
    await TrackPlayer.play();
  });
  
  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    await TrackPlayer.pause();
  });
  
  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    await TrackPlayer.pause();
    await TrackPlayer.seekTo(0);
  });
}; 