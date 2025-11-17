import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';

interface TVFocusableViewProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  hasTVPreferredFocus?: boolean;
}

/**
 * View que es focusable en TV
 * Usa las propiedades nativas de Android TV
 */
export const TVFocusableView: React.FC<TVFocusableViewProps> = ({
  children,
  style,
  onPress,
  hasTVPreferredFocus = false,
  ...props
}) => {
  return (
    <View
      style={[
        style,
        Platform.isTV && styles.tvView,
      ]}
      // @ts-ignore - Propiedades específicas de TV no están en los tipos
      focusable={Platform.isTV ? true : undefined}
      hasTVPreferredFocus={Platform.isTV ? hasTVPreferredFocus : undefined}
      onClick={onPress}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  tvView: {
    // Borde muy visible para TV
    borderWidth: 4,
    borderColor: '#00ff88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    padding: 2,
  },
});

