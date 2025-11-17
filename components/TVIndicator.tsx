import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente de indicador visual para modo TV
 * Solo se muestra en dispositivos TV (útil para debugging)
 */
export const TVIndicator: React.FC<{ showInProduction?: boolean }> = ({ 
  showInProduction = false 
}) => {
  // Solo mostrar en desarrollo o si showInProduction es true
  const shouldShow = Platform.isTV && (__DEV__ || showInProduction);
  
  if (!shouldShow) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Ionicons name="tv" size={16} color="#6c5ce7" />
      <Text style={styles.text}>Modo TV</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#6c5ce7',
  },
  text: {
    color: '#6c5ce7',
    fontSize: 12,
    fontWeight: '600',
  },
});

