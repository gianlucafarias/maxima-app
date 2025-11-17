import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Platform, StyleProp, StyleSheet, TouchableOpacity, ViewStyle, Animated } from 'react-native';

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
 * Usa animación para mostrar claramente el elemento enfocado
 */
export const TVTouchable: React.FC<TVTouchableProps> = ({
  style,
  hasTVPreferredFocus = false,
  children,
  onPress,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(() => {
    console.log('🎯✨ ENFOCADO!!!');
    setIsFocused(true);
    
    // Animar cuando se enfoca
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true,
        friction: 5,
      }),
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, borderAnim]);

  const handleBlur = useCallback(() => {
    console.log('🎯 Desenfocado');
    setIsFocused(false);
    
    // Animar cuando pierde el foco
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }),
      Animated.timing(borderAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, borderAnim]);

  const handlePress = useCallback(() => {
    console.log('🎯🔥 PRESIONADO!');
    if (onPress) {
      onPress();
    }
  }, [onPress]);

  // Interpolar color del borde
  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#00ff88', '#ff00ff'], // Verde -> Magenta cuando está enfocado
  });

  const borderWidth = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 8], // Borde más grueso cuando está enfocado
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={[
          style,
          Platform.isTV && styles.tvFocusable,
          Platform.isTV && {
            borderColor: borderColor as any,
            borderWidth: borderWidth as any,
            backgroundColor: isFocused ? 'rgba(255, 0, 255, 0.3)' : 'rgba(0, 255, 136, 0.1)',
          },
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tvFocusable: {
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
});
