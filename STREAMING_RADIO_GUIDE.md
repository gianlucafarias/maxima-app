# 📻 React Native Track Player para Radio Streaming

## ✅ **¿Soporta Streaming en Vivo?**

**¡SÍ!** React Native Track Player está **diseñado específicamente** para streaming, incluyendo radio en vivo.

### **Formatos Soportados:**
- ✅ **HLS** (`.m3u8`) - HTTP Live Streaming
- ✅ **Direct HTTP streams** - URLs directas de radio
- ✅ **Icecast/Shoutcast** - Servidores de radio tradicionales
- ✅ **DASH** - Dynamic Adaptive Streaming
- ✅ **Progressive HTTP** - Streams progresivos

---

## 🎵 **Configuración para Máxima FM**

### **1. Configuración Básica:**
```typescript
import TrackPlayer, { Track, Capability } from 'react-native-track-player';

// Configurar para radio streaming
await TrackPlayer.setupPlayer({
  // Configuración optimizada para streaming
  waitForBuffer: true,
  autoHandleInterruptions: true,
  autoUpdateMetadata: true,
});

// Configurar capacidades del reproductor
await TrackPlayer.updateOptions({
  capabilities: [
    Capability.Play,
    Capability.Pause,
    Capability.Stop,
  ],
  compactCapabilities: [
    Capability.Play,
    Capability.Pause,
  ],
  // Configuración específica para radio
  progressUpdateEventInterval: 2,
});
```

### **2. Agregar Stream de Radio:**
```typescript
const radioTrack: Track = {
  id: 'maxima-fm-live',
  
  // 🔴 URL de streaming en vivo
  url: 'https://tu-stream-url.com/stream.m3u8', // o .mp3, etc.
  
  // Metadatos
  title: 'Máxima FM',
  artist: '95.5 FM - En Vivo',
  album: 'Radio en Vivo',
  artwork: 'https://tu-logo.com/logo.png',
  
  // ⚡ Configuración específica para live streams
  isLiveStream: true,        // Importante para radio
  duration: undefined,       // Sin duración fija
  
  // Headers opcionales para algunos streams
  headers: {
    'User-Agent': 'Maxima FM App',
    'Icy-MetaData': '1',     // Para metadatos de Icecast
  },
};

await TrackPlayer.add(radioTrack);
```

### **3. Configuración Avanzada para Radio:**
```typescript
// hooks/useRadioPlayer.ts
import TrackPlayer, { 
  Event, 
  State, 
  Track,
  useTrackPlayerEvents,
  usePlaybackState 
} from 'react-native-track-player';

export const useRadioPlayer = () => {
  const playbackState = usePlaybackState();
  const [isLive, setIsLive] = useState(true);
  const [metadata, setMetadata] = useState({
    title: 'Máxima FM',
    artist: 'Cargando...'
  });

  // Configurar player para radio
  const setupRadioPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer({
        waitForBuffer: true,
        autoHandleInterruptions: true,
      });

      const radioTrack: Track = {
        id: 'maxima-fm',
        url: STREAMING_URLS.radioStream, // Tu URL de stream
        title: 'Máxima FM',
        artist: '95.5 FM - En Vivo',
        artwork: require('../assets/images/maxima-logo.png'),
        isLiveStream: true,
      };

      await TrackPlayer.add(radioTrack);
      
      console.log('✅ Radio player configurado');
    } catch (error) {
      console.error('❌ Error configurando radio:', error);
    }
  };

  // Manejar eventos específicos de radio
  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackMetadataReceived], (event) => {
    if (event.type === Event.PlaybackMetadataReceived) {
      // Actualizar metadatos en tiempo real (título de canción, artista)
      setMetadata({
        title: event.title || 'Máxima FM',
        artist: event.artist || '95.5 FM - En Vivo'
      });
    }
  });

  const playRadio = async () => {
    try {
      await TrackPlayer.play();
      // 🎉 Los controles nativos aparecen automáticamente
    } catch (error) {
      console.error('Error playing radio:', error);
    }
  };

  const pauseRadio = async () => {
    await TrackPlayer.pause();
  };

  const stopRadio = async () => {
    await TrackPlayer.stop();
  };

  return {
    playbackState,
    isLive,
    metadata,
    setupRadioPlayer,
    playRadio,
    pauseRadio,
    stopRadio,
  };
};
```

---

## 🔧 **Comparación con Expo-AV**

### **Expo-AV (Actual):**
```typescript
// ✅ También soporta streaming
const { sound } = await Audio.Sound.createAsync(
  { uri: 'https://stream-url.com' },
  { shouldPlay: true }
);
```

### **Track Player (Recomendado):**
```typescript
// ✅ Con controles nativos automáticos
await TrackPlayer.add({
  url: 'https://stream-url.com',
  isLiveStream: true
});
await TrackPlayer.play();
```

---

## 📊 **Ventajas para Radio Streaming**

### **React Native Track Player:**
- ✅ **Controles nativos automáticos** en Control Center/Media Panel
- ✅ **Metadatos en tiempo real** (título de canción actual)
- ✅ **Manejo automático de interrupciones** (llamadas, alarmas)
- ✅ **Optimizado para streaming** (buffering inteligente)
- ✅ **Compatible con CarPlay/Android Auto**
- ✅ **Eventos específicos de radio** (cambio de metadatos)

### **Expo-AV:**
- ✅ **Funciona con Expo Go**
- ✅ **Más simple de configurar**
- ❌ Sin controles nativos automáticos
- ❌ Sin integración con CarPlay/Android Auto

---

## 🎯 **Para tu Caso (Máxima FM)**

### **Configuración Específica:**
```typescript
// Tu stream actual con Track Player
const maximaStream: Track = {
  id: 'maxima-fm-live',
  url: STREAMING_URLS.radioStream, // Tu URL actual
  title: 'Máxima FM',
  artist: '95.5 FM - En Vivo',
  album: 'Radio en Vivo',
  artwork: 'https://maximafm.com/logo.png',
  
  // Configuración para radio en vivo
  isLiveStream: true,
  duration: 0,
  
  // Headers si son necesarios para tu stream
  headers: {
    'User-Agent': 'Maxima FM Mobile App',
  },
};
```

### **Resultado:**
- 📱 **iOS**: Controles en Control Center + Lock Screen
- 🤖 **Android**: Media controls + Lock Screen + Notification
- 🚗 **CarPlay/Android Auto**: Funciona automáticamente
- 🎵 **Metadatos**: Título de canción actual (si tu stream los envía)

---

## ⚡ **Migración Paso a Paso**

### **Paso 1: Instalar Track Player**
```bash
npx expo install react-native-track-player
npx expo prebuild
```

### **Paso 2: Reemplazar useAudio**
```typescript
// Antes
const { playMedia, stopMedia } = useAudio();

// Después  
const { playRadio, stopRadio } = useRadioPlayer();
```

### **Paso 3: Obtener Controles Nativos**
Sin código adicional - aparecen automáticamente 🎉

---

## ❓ **¿La Recomendación Cambia?**

**¡SÍ!** Sabiendo que es para radio streaming:

### **Para Prototipo/Desarrollo:**
1. **Mantener expo-av** temporalmente
2. **Usar hook mejorado** para mejor experiencia

### **Para Producción:**
1. **Migrar a Track Player** definitivamente
2. Los controles nativos son **esenciales** para radio
3. Compatible con autos y dispositivos externos

¿Tu stream actual es compatible con estos formatos? ¿Qué URL usas actualmente? 