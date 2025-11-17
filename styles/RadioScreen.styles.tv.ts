import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Estilos específicos para Android TV / Apple TV
 * Estos estilos se usan solo en dispositivos TV
 */
export const tvStyles = Platform.isTV ? StyleSheet.create({
  container: {
    flex: 1,
  },
  // Layout de dos columnas
  tvMainContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 20,
  },
  tvLeftColumn: {
    flex: 0.45, // 45% del ancho
    paddingHorizontal: width * 0.03,
  },
  tvRightColumn: {
    flex: 0.55, // 55% del ancho
    paddingHorizontal: width * 0.03,
  },
  tvColumnContent: {
    paddingBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
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
    marginBottom: 20,
    backgroundColor: 'rgba(162, 155, 254, 0.1)',
    marginHorizontal: 15,
    borderRadius: 25,
    padding: 4,
    minHeight: 50,
  },
  switchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 100,
  },
  switchButtonActive: {
    backgroundColor: '#6c5ce7',
  },
  switchText: {
    color: '#a29bfe',
    marginLeft: 8,
    fontSize: 16, // Reducido
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
  switchTextActive: {
    color: 'white',
  },
  playerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  stationInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  stationName: {
    fontSize: 22, // Reducido
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  frequency: {
    fontSize: 18, // Reducido
    color: '#a29bfe',
    marginBottom: 15,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
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
    fontSize: 16, // Reducido
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: width * 0.05, // Margen de seguridad para overscan
  },
  controlsContainer: {
    padding: 15,
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

