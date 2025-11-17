import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

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

  // Con react-native-tvos, el sistema nativo maneja la navegación automáticamente
  // Solo trackeamos el foco visual para mostrar qué elemento está seleccionado
  // Los eventos onFocus/onBlur funcionan correctamente con react-native-tvos

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

