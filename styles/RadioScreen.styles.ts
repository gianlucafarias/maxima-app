import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  leftSpacer: {
    width: 48, // Mismo ancho que el botón (padding 10 + icon 28 + padding 10)
  },
  logoCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButton: {
    padding: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(162, 155, 254, 0.1)',
    marginHorizontal: 60,
    borderRadius: 25,
    padding: 4,
  },
  switchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  switchButtonActive: {
    backgroundColor: '#6c5ce7',
  },
  switchText: {
    color: '#a29bfe',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  switchTextActive: {
    color: 'white',
  },
  playerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationInfo: {
    alignItems: 'center',
    marginTop: 40,
  },
  stationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  frequency: {
    fontSize: 18,
    color: '#a29bfe',
    marginBottom: 15,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  modeIndicator: {
    fontSize: 12,
    color: '#a29bfe',
    marginTop: 8,
    opacity: 0.8,
  },
  mediaControlsInfo: {
    fontSize: 12,
    color: '#00ff88',
    marginTop: 8,
    opacity: 0.8,
    fontWeight: '500',
  },
  programsSection: {
    padding: 20,
  },
  programsSectionHeader: {
    marginBottom: 20,
  },
  programsSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  programsContainer: {
    gap: 20,
  },
  updateInfo: {
    backgroundColor: 'rgba(162, 155, 254, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  updateText: {
    fontSize: 14,
    color: 'white',
    flex: 1,
  },
  manualUpdateButton: {
    backgroundColor: '#6c5ce7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  manualUpdateButtonDisabled: {
    backgroundColor: '#666',
  },
  manualUpdateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 4,
  },
  manualUpdateTextDisabled: {
    color: '#999',
  },
  updateCountText: {
    fontSize: 12,
    color: '#a29bfe',
    marginBottom: 2,
  },
  nextUpdateText: {
    fontSize: 12,
    color: '#a29bfe',
  },
  youtubeLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  youtubeLoadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(162, 155, 254, 0.2)',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a29bfe',
    marginLeft: 8,
    marginRight: 8,
  },
  bottomSpace: {
    height: 100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  controlsContainer: {
    padding: 20,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
    padding: 10,
  },
  controlText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a29bfe',
    marginTop: 4,
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  controlTextDisabled: {
    color: '#666',
  },
  liveIndicator: {
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginHorizontal: 20,
  },
  liveIndicatorContent: {
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginBottom: 4,
  },
  liveIndicatorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  liveTitle: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  viewerCount: {
    fontSize: 10,
    color: 'white',
    opacity: 0.8,
  },
  videoLiveInfo: {
    marginTop: 4,
    alignItems: 'center',
  },
  videoViewerCount: {
    fontSize: 11,
    color: '#00ff88',
    opacity: 0.8,
    textAlign: 'center',
  },
  quotaInfo: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  quotaText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a29bfe',
    marginBottom: 4,
  },
  quotaSubText: {
    fontSize: 10,
    color: '#a29bfe',
    opacity: 0.7,
    marginBottom: 8,
  },
  rssToggleButton: {
    backgroundColor: 'rgba(162, 155, 254, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rssToggleText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  // Estilos para notificaciones
  notificationInfo: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6c5ce7',
  },
  notificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  notificationStatusText: {
    fontSize: 12,
    color: '#ddd',
    fontWeight: '600',
    marginLeft: 8,
  },
  tokenInfo: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'Courier New',
    letterSpacing: 0.5,
  },
  expoGoWarning: {
    fontSize: 11,
    color: '#ffbe0b',
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'center',
  },
  // Estilos para el botón de WhatsApp
  whatsappContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 24,
    paddingVertical: 12,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
}); 