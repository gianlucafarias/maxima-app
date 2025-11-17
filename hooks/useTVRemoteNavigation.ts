import { useEffect } from 'react';
import { Platform, TVEventHandler } from 'react-native';

export type TVRemoteEvent = {
  eventType: 'up' | 'down' | 'left' | 'right' | 'select' | 'back' | 'playPause' | 'menu';
};

export type TVRemoteHandler = (event: TVRemoteEvent) => void;

/**
 * Hook para manejar eventos del control remoto de TV
 * Solo funciona en plataformas TV (Android TV, Apple TV)
 * 
 * @param handler - Función callback que recibe los eventos del control remoto
 * 
 * @example
 * useTVRemoteNavigation((event) => {
 *   if (event.eventType === 'select') {
 *     console.log('Botón OK presionado');
 *   }
 * });
 */
export const useTVRemoteNavigation = (handler: TVRemoteHandler) => {
  useEffect(() => {
    // Solo ejecutar en plataformas TV
    if (!Platform.isTV) {
      return;
    }

    let tvEventHandler: TVEventHandler | null = null;

    try {
      tvEventHandler = new TVEventHandler();

      tvEventHandler.enable(null, (cmp, evt) => {
        console.log('🎮 TV Remote Event:', evt.eventType);
        
        // Mapear eventos nativos a nuestro formato simplificado
        const eventTypeMap: { [key: string]: TVRemoteEvent['eventType'] } = {
          'up': 'up',
          'down': 'down',
          'left': 'left',
          'right': 'right',
          'select': 'select',
          'longSelect': 'select',
          'playPause': 'playPause',
          'play': 'playPause',
          'pause': 'playPause',
          'menu': 'menu',
          'back': 'back',
        };

        const mappedEventType = eventTypeMap[evt.eventType];
        
        if (mappedEventType) {
          handler({ eventType: mappedEventType });
        }
      });
    } catch (error) {
      console.warn('⚠️ Error inicializando TVEventHandler:', error);
    }

    // Cleanup
    return () => {
      if (tvEventHandler) {
        tvEventHandler.disable();
      }
    };
  }, [handler]);

  return {
    isTV: Platform.isTV,
  };
};

