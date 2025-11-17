import React, { useCallback, useState } from 'react';
import { Platform, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

interface TVTouchableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  focusedStyle?: StyleProp<ViewStyle>;
  hasTVPreferredFocus?: boolean;
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
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    if (Platform.isTV) {
      console.log('🎯 Elemento enfocado');
      setIsFocused(true);
    }
  }, []);

  const handleBlur = useCallback(() => {
    if (Platform.isTV) {
      console.log('🎯 Elemento desenfocado');
      setIsFocused(false);
    }
  }, []);

  // Estilo por defecto para foco en TV
  const defaultFocusedStyle: ViewStyle = Platform.isTV ? {
    borderWidth: 3,
    borderColor: '#6c5ce7',
    transform: [{ scale: 1.05 }],
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  } : {};

  // Combinar estilos
  const combinedStyle = [
    style,
    Platform.isTV && isFocused && defaultFocusedStyle,
    Platform.isTV && isFocused && focusedStyle,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        combinedStyle,
        // En móvil, mostrar feedback visual al presionar
        !Platform.isTV && pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      hasTVPreferredFocus={Platform.isTV ? hasTVPreferredFocus : undefined}
      {...props}
    >
      {children}
    </Pressable>
  );
};

