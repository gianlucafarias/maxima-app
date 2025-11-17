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

  // Log cuando cambia el estado de foco
  useEffect(() => {
    if (Platform.isTV) {
      console.log(`🎯🎯🎯 TVTouchable [${id}]:`, isFocused ? '✨✨✨ ENFOCADO ✨✨✨' : '❌ sin foco');
      if (isFocused) {
        console.log(`🔥🔥🔥 ESTILO DE FOCO APLICADO A [${id}] - Borde ROJO de 20px`);
      }
    }
  }, [isFocused, id]);

  return (
    <TouchableOpacity
      style={[
        style, 
        Platform.isTV && focusStyle,
        Platform.isTV && isFocused && {
          // Estilos adicionales cuando está enfocado para asegurar visibilidad
          position: 'relative',
        }
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
    borderWidth: 20,
    borderColor: '#ff0000', // ROJO BRILLANTE cuando está enfocado - MUY GRUESO
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
    transform: [{ scale: 1.3 }],
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
    elevation: 100,
    zIndex: 99999,
    borderRadius: 16,
  },
  unfocused: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
});
