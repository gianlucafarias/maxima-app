import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Platform, TVEventHandler } from 'react-native';

interface FocusableElement {
  id: string;
  onPress?: () => void;
}

interface TVFocusContextType {
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  registerFocusable: (id: string, onPress?: () => void) => void;
  unregisterFocusable: (id: string) => void;
  focusableElements: Map<string, FocusableElement>;
}

const TVFocusContext = createContext<TVFocusContextType | undefined>(undefined);

export const TVFocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [focusedId, setFocusedId] = useState<string | null>('audio-switch'); // Foco inicial
  const focusableElementsRef = useRef<Map<string, FocusableElement>>(new Map());
  const [, forceUpdate] = useState({});

  const registerFocusable = useCallback((id: string, onPress?: () => void) => {
    console.log('📝 Registrando elemento focusable:', id);
    focusableElementsRef.current.set(id, { id, onPress });
    forceUpdate({});
  }, []);

  const unregisterFocusable = useCallback((id: string) => {
    console.log('🗑️ Desregistrando elemento focusable:', id);
    focusableElementsRef.current.delete(id);
    forceUpdate({});
  }, []);

  // Manejar eventos del control remoto solo en TV
  useEffect(() => {
    if (!Platform.isTV) return;

    let tvEventHandler: TVEventHandler | null = null;

    try {
      tvEventHandler = new TVEventHandler();
      
      tvEventHandler.enable(null, (cmp, evt) => {
        const eventType = evt.eventType;
        console.log('🎮 Evento TV:', eventType, '| Foco actual:', focusedId);

        const focusablesArray = Array.from(focusableElementsRef.current.keys());
        const currentIndex = focusablesArray.indexOf(focusedId || '');

        console.log('📋 Elementos focusables:', focusablesArray.length, '| Índice actual:', currentIndex);

        if (eventType === 'select' || eventType === 'longSelect') {
          console.log('✅ SELECT presionado en:', focusedId);
          const element = focusableElementsRef.current.get(focusedId || '');
          if (element?.onPress) {
            console.log('🔥 Ejecutando onPress de:', focusedId);
            element.onPress();
          }
        } else if (eventType === 'down' || eventType === 'right') {
          // Navegar al siguiente elemento
          const nextIndex = (currentIndex + 1) % focusablesArray.length;
          const nextId = focusablesArray[nextIndex];
          console.log('⬇️➡️ Navegando a:', nextId);
          setFocusedId(nextId);
        } else if (eventType === 'up' || eventType === 'left') {
          // Navegar al elemento anterior
          const prevIndex = currentIndex <= 0 ? focusablesArray.length - 1 : currentIndex - 1;
          const prevId = focusablesArray[prevIndex];
          console.log('⬆️⬅️ Navegando a:', prevId);
          setFocusedId(prevId);
        }
      });

      console.log('🎮 TVEventHandler inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando TVEventHandler:', error);
    }

    return () => {
      if (tvEventHandler) {
        tvEventHandler.disable();
      }
    };
  }, [focusedId]);

  return (
    <TVFocusContext.Provider value={{ 
      focusedId, 
      setFocusedId, 
      registerFocusable, 
      unregisterFocusable,
      focusableElements: focusableElementsRef.current
    }}>
      {children}
    </TVFocusContext.Provider>
  );
};

export const useTVFocus = () => {
  const context = useContext(TVFocusContext);
  if (!context) {
    throw new Error('useTVFocus debe usarse dentro de TVFocusProvider');
  }
  return context;
};

