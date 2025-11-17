import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useNativeTVRemote } from '@/hooks/useNativeTVRemote';

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

  // Manejar eventos del control remoto usando listener nativo
  useNativeTVRemote((event) => {
    console.log('🎮🎮🎮 EVENTO NATIVO RECIBIDO:', event.eventType, '| Foco actual:', focusedId);

    const focusablesArray = Array.from(focusableElementsRef.current.keys());
    const currentIndex = focusablesArray.indexOf(focusedId || '');

    console.log('📋 Total elementos:', focusablesArray.length, '| Índice actual:', currentIndex, '| IDs:', focusablesArray);

    if (event.eventType === 'select') {
      console.log('✅✅✅ SELECT presionado en:', focusedId);
      const element = focusableElementsRef.current.get(focusedId || '');
      if (element?.onPress) {
        console.log('🔥🔥🔥 Ejecutando onPress de:', focusedId);
        element.onPress();
      } else {
        console.log('⚠️ Elemento sin onPress:', focusedId);
      }
    } else if (event.eventType === 'down' || event.eventType === 'right') {
      // Navegar al siguiente elemento
      if (focusablesArray.length > 0) {
        const nextIndex = (currentIndex + 1) % focusablesArray.length;
        const nextId = focusablesArray[nextIndex];
        console.log('⬇️➡️ Navegando de', focusedId, 'a', nextId);
        setFocusedId(nextId);
      }
    } else if (event.eventType === 'up' || event.eventType === 'left') {
      // Navegar al elemento anterior
      if (focusablesArray.length > 0) {
        const prevIndex = currentIndex <= 0 ? focusablesArray.length - 1 : currentIndex - 1;
        const prevId = focusablesArray[prevIndex];
        console.log('⬆️⬅️ Navegando de', focusedId, 'a', prevId);
        setFocusedId(prevId);
      }
    }
  });

  // Log cuando cambia el foco
  useEffect(() => {
    if (Platform.isTV && focusedId) {
      console.log('🎯🎯🎯 FOCO CAMBIADO A:', focusedId);
      const element = focusableElementsRef.current.get(focusedId);
      console.log('📦 Elemento:', element ? 'encontrado' : 'NO encontrado');
    }
  }, [focusedId]);

  // Log cuando se registran elementos
  useEffect(() => {
    if (Platform.isTV) {
      const count = focusableElementsRef.current.size;
      console.log('📊 Total elementos focusables registrados:', count);
      if (count > 0) {
        console.log('📋 IDs registrados:', Array.from(focusableElementsRef.current.keys()));
      }
    }
  }, [forceUpdate]);

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

