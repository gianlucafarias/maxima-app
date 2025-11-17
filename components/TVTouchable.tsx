import React, { useEffect } from 'react';
import { Platform, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTVFocus } from '../contexts/TVFocusContext';

interface TVTouchableProps {
  id: string; // ID único requerido para el sistema de foco
  style?: StyleProp<ViewStyle>;
  focusedStyle?: StyleProp<ViewStyle>;
  hasTVPreferredFocus?: boolean;
  onPress?: () => void;
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
    if (onPress) {
      onPress();
    }
  };

  const handleFocus = () => {
    if (Platform.isTV) {
      console.log('🎯✨ FOCO MANUAL EN:', id);
      setFocusedId(id);
    }
  };

  // Estilo visible cuando está enfocado
  const focusStyle = isFocused ? styles.focused : styles.unfocused;

  // Log cuando cambia el estado de foco
  useEffect(() => {
    if (Platform.isTV) {
      console.log(`🎯 TVTouchable [${id}]:`, isFocused ? 'ENFOCADO ✨' : 'sin foco');
    }
  }, [isFocused, id]);

  return (
    <TouchableOpacity
      style={[style, Platform.isTV && focusStyle]}
      onPress={handlePress}
      onFocus={handleFocus}
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
    borderWidth: 4,
    borderColor: '#00ffff', // CYAN brillante cuando está enfocado
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    transform: [{ scale: 1.08 }],
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 25,
  },
  unfocused: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
});
