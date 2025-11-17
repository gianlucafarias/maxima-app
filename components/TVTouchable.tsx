import React from 'react';
import { Platform, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

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
 * En TV, Android aplica automáticamente el estilo de foco nativo
 */
export const TVTouchable: React.FC<TVTouchableProps> = ({
  style,
  hasTVPreferredFocus = false,
  children,
  onPress,
  disabled = false,
}) => {
  const handlePress = () => {
    console.log('🎯🔥 PRESIONADO!');
    if (onPress) {
      onPress();
    }
  };

  // Crear estilo combinado con borde visible para TV
  const combinedStyle = StyleSheet.flatten([
    style,
    Platform.isTV && styles.tvFocusable,
  ]);

  return (
    <TouchableOpacity
      style={combinedStyle}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={Platform.isTV ? 1 : 0.7}
      hasTVPreferredFocus={Platform.isTV ? hasTVPreferredFocus : undefined}
      // Propiedades nativas de Android TV que SÍ funcionan
      tvParallaxProperties={Platform.isTV ? {
        enabled: true,
        shiftDistanceX: 3.0,
        shiftDistanceY: 3.0,
        tiltAngle: 0.1,
        magnification: 1.15,
        pressMagnification: 1.0,
        pressDuration: 0.3,
      } : undefined}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tvFocusable: {
    // Borde MUY VISIBLE SIEMPRE en TV para saber qué es clickeable
    borderWidth: 5,
    borderColor: '#00ff88', // Verde brillante SIEMPRE
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
});
