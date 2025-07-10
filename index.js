// index.js - Punto de entrada con Track Player y Firebase Messaging
import messaging from '@react-native-firebase/messaging';
import 'expo-router/entry';
import TrackPlayer from 'react-native-track-player';
import PlaybackService from './service';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  
  // Aquí puedes agregar lógica personalizada para mensajes en background
  // Por ejemplo: actualizar cache, mostrar notificación local, etc.
  
  // Si el mensaje contiene data, puedes procesarlo
  if (remoteMessage.data) {
    
    // Ejemplo: guardar en AsyncStorage para procesarlo cuando abra la app
    // await AsyncStorage.setItem('pendingNotification', JSON.stringify(remoteMessage.data));
  }
});


// Registrar el servicio de Track Player
TrackPlayer.registerPlaybackService(() => PlaybackService);

