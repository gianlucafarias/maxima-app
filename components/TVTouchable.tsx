import React from 'react';
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
 * Componente simple que funciona en móvil y TV
 * SIN estilos adicionales para no romper el diseño
 */
export const TVTouchable: React.FC<TVTouchableProps> = ({
  style,
  hasTVPreferredFocus = false,
  children,
  onPress,
  disabled = false,
}) => {
  const handlePress = () => {
    console.log('🎯🔥 CLICK/ENTER PRESIONADO');
    if (onPress) {
      onPress();
    }
  };

  const handleFocus = () => {
    console.log('🎯✨✨✨ FOCO RECIBIDO ✨✨✨');
  };

  const handleBlur = () => {
    console.log('🎯 Foco perdido');
  };

  return (
    <TouchableOpacity
      style={style}
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
