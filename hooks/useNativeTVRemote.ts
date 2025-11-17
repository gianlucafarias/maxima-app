import { useEffect } from 'react';
import { Platform, DeviceEventEmitter, NativeEventEmitter } from 'react-native';

export type TVRemoteEvent = {
  eventType: 'up' | 'down' | 'left' | 'right' | 'select' | 'back' | 'playPause';
  keyCode: number;
};

export type TVRemoteHandler = (event: TVRemoteEvent) => void;

/**
 * Hook para escuchar eventos de teclado nativos del control remoto de TV
 * Usa DeviceEventEmitter para recibir eventos desde MainActivity.kt
 */
export const useNativeTVRemote = (handler: TVRemoteHandler) => {
  useEffect(() => {
    if (!Platform.isTV) {
      return;
    }

    console.log('🎮🎮🎮 Inicializando listener nativo de eventos de teclado');

    const subscription = DeviceEventEmitter.addListener(
      'TVRemoteKeyEvent',
      (event: { eventType: string; keyCode: number }) => {
        console.log('🎮🎮🎮 EVENTO NATIVO RECIBIDO:', event.eventType, '| keyCode:', event.keyCode);
        
        const mappedEvent: TVRemoteEvent = {
          eventType: event.eventType as TVRemoteEvent['eventType'],
          keyCode: event.keyCode,
        };
        
        handler(mappedEvent);
      }
    );

    console.log('✅ Listener nativo registrado correctamente');

    return () => {
      console.log('🗑️ Removiendo listener nativo');
      subscription.remove();
    };
  }, [handler]);
};

