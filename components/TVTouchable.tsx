import React, { useCallback, useState } from 'react';
import { Platform, StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

interface TVTouchableProps {
  style?: StyleProp<ViewStyle>;
  focusedStyle?: StyleProp<ViewStyle>;
  hasTVPreferredFocus?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Componente que funciona tanto en dispositivos táctiles como en TV
 * En TV, muestra un estilo especial cuando el elemento tiene foco
 * En móvil, funciona como un TouchableOpacity normal
 */
export const TVTouchable: React.FC<TVTouchableProps> = ({
  style,
  focusedStyle,
  hasTVPreferredFocus = false,
  children,
  onPress,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    if (Platform.isTV) {
      console.log('🎯✨ ELEMENTO ENFOCADO ✨');
      setIsFocused(true);
    }
  }, []);

  const handleBlur = useCallback(() => {
    if (Platform.isTV) {
      console.log('🎯 Elemento desenfocado');
      setIsFocused(false);
    }
  }, []);

  const handlePress = useCallback(() => {
    console.log('🎯🔥 PRESIONADO - ejecutando onPress');
    if (onPress) {
      onPress();
    }
  }, [onPress]);

  // Estilo por defecto para foco en TV - MUY VISIBLE
  const defaultFocusedStyle: ViewStyle = Platform.isTV ? {
    borderWidth: 4,
    borderColor: '#00ff88', // Verde brillante muy visible
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    transform: [{ scale: 1.08 }],
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 20,
  } : {};

  // Combinar estilos
  const combinedStyle = [
    style,
    Platform.isTV && isFocused && defaultFocusedStyle,
    Platform.isTV && isFocused && focusedStyle,
  ];

  return (
    <TouchableOpacity
      style={combinedStyle}
      onPress={handlePress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      activeOpacity={Platform.isTV ? 1 : 0.7}
      hasTVPreferredFocus={Platform.isTV ? hasTVPreferredFocus : undefined}
      tvParallaxProperties={Platform.isTV ? {
        enabled: true,
        shiftDistanceX: 2.0,
        shiftDistanceY: 2.0,
        tiltAngle: 0.05,
        magnification: 1.1,
      } : undefined}
    >
      {children}
    </TouchableOpacity>
  );
};

