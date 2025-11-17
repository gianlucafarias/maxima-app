import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Estilos específicos para Android TV / Apple TV
 * Estos estilos se usan solo en dispositivos TV
 */
export const tvStyles = Platform.isTV ? StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.08, // Mayor margen para overscan
    marginBottom: 30,
  },
  leftSpacer: {
    width: 60,
  },
  logoCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(162, 155, 254, 0.1)',
    minWidth: 60,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(162, 155, 254, 0.1)',
    marginHorizontal: width * 0.25, // Más centrado en TV
    borderRadius: 30,
    padding: 6,
    minHeight: 70,
  },
  switchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 120,
  },
  switchButtonActive: {
    backgroundColor: '#6c5ce7',
  },
  switchText: {
    color: '#a29bfe',
    marginLeft: 12,
    fontSize: 22, // Más grande para TV
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
  switchTextActive: {
    color: 'white',
  },
  playerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  stationInfo: {
    alignItems: 'center',
    marginTop: 50,
  },
  stationName: {
    fontSize: 32, // Más grande para TV
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  frequency: {
    fontSize: 24, // Más grande para TV
    color: '#a29bfe',
    marginBottom: 20,
  },
  whatsappContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  whatsappText: {
    fontSize: 20, // Más grande para TV
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: width * 0.05, // Margen de seguridad para overscan
  },
  controlsContainer: {
    padding: 30,
  },
  bottomSpace: {
    height: 80,
  },
}) : {};

/**
 * Función helper para obtener estilos TV o móvil
 */
export const getTVStyle = (tvStyle: any, mobileStyle: any) => {
  return Platform.isTV && tvStyle ? tvStyle : mobileStyle;
};

