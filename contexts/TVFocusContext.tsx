import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Platform, TVEventHandler } from 'react-native';

interface TVFocusContextType {
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  registerFocusable: (id: string) => void;
  unregisterFocusable: (id: string) => void;
}

const TVFocusContext = createContext<TVFocusContextType | undefined>(undefined);

export const TVFocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [focusedId, setFocusedId] = useState<string | null>('audio-switch'); // Foco inicial
  const [focusables, setFocusables] = useState<Set<string>>(new Set());

  const registerFocusable = useCallback((id: string) => {
    console.log('📝 Registrando elemento focusable:', id);
    setFocusables(prev => new Set(prev).add(id));
  }, []);

  const unregisterFocusable = useCallback((id: string) => {
    console.log('🗑️ Desregistrando elemento focusable:', id);
    setFocusables(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // Manejar eventos del control remoto solo en TV
  useEffect(() => {
    if (!Platform.isTV) return;

    let tvEventHandler: TVEventHandler | null = null;

    try {
      tvEventHandler = new TVEventHandler();
      
      tvEventHandler.enable(null, (cmp, evt) => {
        console.log('🎮 Evento TV:', evt.eventType);
        
        if (evt.eventType === 'select' || evt.eventType === 'longSelect') {
          console.log('✅ SELECT - ID enfocado:', focusedId);
          // El componente individual manejará el onPress
        }
      });
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
    <TVFocusContext.Provider value={{ focusedId, setFocusedId, registerFocusable, unregisterFocusable }}>
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

