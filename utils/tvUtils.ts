import { Dimensions, Platform } from 'react-native';

/**
 * Utilidades para detectar y adaptar la UI a dispositivos TV
 */

export const isTV = Platform.isTV;

export const getTVAdjustedDimensions = () => {
  const { width, height } = Dimensions.get('window');
  
  if (isTV) {
    // En TV, aplicar márgenes de seguridad (overscan)
    // Típicamente 5-10% en cada lado
    const overscanMargin = 0.05;
    return {
      width: width * (1 - overscanMargin * 2),
      height: height * (1 - overscanMargin * 2),
      marginHorizontal: width * overscanMargin,
      marginVertical: height * overscanMargin,
    };
  }
  
  return {
    width,
    height,
    marginHorizontal: 0,
    marginVertical: 0,
  };
};

export const getTVScaledSize = (mobileSize: number, tvScale = 1.5): number => {
  // En TV, los elementos suelen necesitar ser más grandes
  return isTV ? mobileSize * tvScale : mobileSize;
};

export const getTVFontSize = (mobileSize: number): number => {
  // Fonts en TV necesitan ser más grandes para legibilidad
  return isTV ? mobileSize * 1.3 : mobileSize;
};

export const getTVSpacing = (mobileSpacing: number): number => {
  // Espaciado más amplio en TV
  return isTV ? mobileSpacing * 1.5 : mobileSpacing;
};

