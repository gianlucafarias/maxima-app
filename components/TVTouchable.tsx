import React, { useEffect } from 'react';
import { Platform, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTVFocus } from '../contexts/TVFocusContext';

interface TVTouchableProps {
  id: string; // ID único requerido para el sistema de foco
  style?: StyleProp<ViewStyle>;
  focusedStyle?: StyleProp<ViewStyle>;
  hasTVPreferredFocus?: boolean;
  onPress?: () => void;
  onFocus?: () => void; // Callback cuando el elemento recibe foco
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Componente con sistema de foco manual para TV
 * Muestra claramente cuál elemento está enfocado
 */
export const TVTouchable: React.FC<TVTouchableProps> = ({
  id,
  style,
  hasTVPreferredFocus = false,
  children,
  onPress,
  onFocus: onFocusCallback,
  disabled = false,
}) => {
  const { focusedId, setFocusedId, registerFocusable, unregisterFocusable } = useTVFocus();
  const isFocused = Platform.isTV && focusedId === id;

  // Registrar este elemento como focusable
  useEffect(() => {
    if (Platform.isTV) {
      registerFocusable(id, onPress);
      
      // Si tiene preferencia de foco inicial, establecerlo
      if (hasTVPreferredFocus) {
        setFocusedId(id);
      }
    }
    
    return () => {
      if (Platform.isTV) {
        unregisterFocusable(id);
      }
    };
  }, [id, hasTVPreferredFocus, onPress, registerFocusable, unregisterFocusable, setFocusedId]);

  const handlePress = () => {
    console.log('🎯🔥 PRESIONADO:', id);
    
    // En TV, cuando haces click, establecer el foco INMEDIATAMENTE
    if (Platform.isTV) {
      console.log('🎯✨✨✨ ESTABLECIENDO FOCO INMEDIATAMENTE:', id);
      setFocusedId(id);
    }
    
    if (onPress) {
      onPress();
    }
  };

  const handleFocus = () => {
    if (Platform.isTV) {
      console.log('🎯✨ FOCO NATIVO EN:', id);
      // Con react-native-tvos, onFocus funciona correctamente
      setFocusedId(id);
      // Llamar callback personalizado si existe
      if (onFocusCallback) {
        onFocusCallback();
      }
    }
  };

  const handleBlur = () => {
    if (Platform.isTV && focusedId === id) {
      console.log('🎯 Foco perdido:', id);
      // El sistema nativo manejará el cambio de foco automáticamente
    }
  };

  // Estilo visible cuando está enfocado
  const focusStyle = isFocused ? styles.focused : styles.unfocused;

  // Log cuando cambia el estado de foco (solo en desarrollo)
  useEffect(() => {
    if (Platform.isTV && __DEV__) {
      console.log(`🎯 TVTouchable [${id}]:`, isFocused ? '✨ ENFOCADO' : 'sin foco');
    }
  }, [isFocused, id]);

  // Extraer borderRadius y overflow del style si existe para mantener consistencia
  const styleArray = Array.isArray(style) ? style : [style];
  const styleProps = styleArray.reduce((acc: any, s: any) => {
    if (s && typeof s === 'object') {
      if (s.borderRadius !== undefined) acc.borderRadius = s.borderRadius;
      if (s.overflow !== undefined) acc.overflow = s.overflow;
    }
    return acc;
  }, {});

  return (
    <TouchableOpacity
      style={[
        style, 
        Platform.isTV && focusStyle,
        Platform.isTV && isFocused && Object.keys(styleProps).length > 0 && styleProps,
      ]}
      onPress={handlePress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      activeOpacity={Platform.isTV ? 1 : 0.7}
      hasTVPreferredFocus={Platform.isTV ? hasTVPreferredFocus : undefined}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  focused: {
    borderWidth: 2,
    borderColor: '#a29bfe', // Color púrpura que combina con el tema de la app
    backgroundColor: 'rgba(162, 155, 254, 0.05)', // Fondo muy sutil
    shadowColor: '#a29bfe',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  unfocused: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
});
