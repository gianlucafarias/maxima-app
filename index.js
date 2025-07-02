// index.js - Punto de entrada con Track Player y Firebase Messaging
import messaging from '@react-native-firebase/messaging';
import 'expo-router/entry';
import TrackPlayer from 'react-native-track-player';
import PlaybackService from './service';

// 🔥 CRÍTICO: Background Message Handler DEBE ir ANTES de expo-router
console.log('🔔 Configurando Firebase Background Message Handler...');
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('🔔 Mensaje de Firebase recibido en background:', remoteMessage);
  
  // Aquí puedes agregar lógica personalizada para mensajes en background
  // Por ejemplo: actualizar cache, mostrar notificación local, etc.
  
  // Si el mensaje contiene data, puedes procesarlo
  if (remoteMessage.data) {
    console.log('📦 Data del mensaje:', remoteMessage.data);
    
    // Ejemplo: guardar en AsyncStorage para procesarlo cuando abra la app
    // await AsyncStorage.setItem('pendingNotification', JSON.stringify(remoteMessage.data));
  }
});

console.log('✅ Background Message Handler configurado');

// Registrar el servicio de Track Player
console.log('🔧 Registrando servicio TrackPlayer...');
TrackPlayer.registerPlaybackService(() => PlaybackService);

// 🚀 ÚLTIMO: Inicializar expo-router (esto debe ir AL FINAL)
console.log('🚀 Inicializando Expo Router...');
