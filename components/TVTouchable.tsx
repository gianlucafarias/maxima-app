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
      registerFocusable(id);
      
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
  }, [id, hasTVPreferredFocus, registerFocusable, unregisterFocusable, setFocusedId]);

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
    borderWidth: 6,
    borderColor: '#ff00ff', // MAGENTA brillante cuando está enfocado
    backgroundColor: 'rgba(255, 0, 255, 0.25)',
    transform: [{ scale: 1.05 }],
    shadowColor: '#ff00ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 20,
  },
  unfocused: {
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 136, 0.4)', // Verde claro cuando NO está enfocado
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
  },
});
