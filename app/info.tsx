import { MaximaLogo } from '@/components/MaximaLogo';
import { TVTouchable } from '@/components/TVTouchable';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function InfoScreen() {
  const programas = [
    {
      id: 1,
      nombre: "De Mañana Es Mejor",
      horario: "07:00 - 09:00",
      descripcion: "Empezá tu día con la mejor música y noticias",
      icon: "sunny-outline"
    },
    {
      id: 2,
      nombre: "Bunker Radio de Mañana",
      horario: "09:00 - 12:00",
      descripcion: "Martin Farias y equipo hacen la mañana de la radio.",
      icon: "musical-notes-outline"
    },
    {
        id: 3,
        nombre: "El Tapón Deportivo",
        horario: "13:00 - 14:00",
        descripcion: "El deporte en vivo",
        icon: "football-outline"
      },
    {
      id: 4,
      nombre: "El Cofre",
      horario: "18:00 - 21:00",
      descripcion: "Los clásicos de la max.",
      icon: "moon-outline"
    }
  ];

  const contactInfo = [
    {
      type: "Teléfono",
      value: "+54 (3491) 416237",
      icon: "call-outline"
    },
    {
      type: "Dirección",
      value: "Tristán Malbran 426 Ceres, Santa Fe",
      icon: "location-outline"
    }
  ];

  const goBack = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Header */}
        <View style={styles.logoContainer}>
          <TVTouchable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#a29bfe" />
          </TVTouchable>
          <View style={styles.logoCenter}>
            <MaximaLogo width={140} height={44} color="white" />
          </View>
          <View style={styles.rightSpacer} />
        </View>

        {/* About Section
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(108, 92, 231, 0.2)', 'rgba(162, 155, 254, 0.1)']}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>Nuestra Historia</Text>
            <Text style={styles.description}>
              Radio Máxima FM es tu compañía las 24 horas del día con la mejor música, 
              noticias y entretenimiento. Desde 1995, hemos sido la voz de nuestra comunidad, 
              transmitiendo los éxitos más populares y conectando a las familias a través de la música.
            </Text>
          </LinearGradient>
        </View>
 */}
        {/* Programs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programación</Text>
          {programas.map((programa) => (
            <LinearGradient
              key={programa.id}
              colors={['rgba(76, 102, 159, 0.2)', 'rgba(25, 47, 106, 0.1)']}
              style={styles.programCard}
            >
              <View style={styles.programHeader}>
                <Ionicons name={programa.icon as any} size={24} color="#a29bfe" />
                <View style={styles.programInfo}>
                  <Text style={styles.programName}>{programa.nombre}</Text>
                  <Text style={styles.programTime}>{programa.horario}</Text>
                </View>
              </View>
              <Text style={styles.programDescription}>{programa.descripcion}</Text>
            </LinearGradient>
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contáctanos</Text>
          {contactInfo.map((contact, index) => (
            <TVTouchable key={index}>
              <LinearGradient
                colors={['rgba(108, 92, 231, 0.15)', 'rgba(162, 155, 254, 0.05)']}
                style={styles.contactCard}
              >
                <Ionicons name={contact.icon as any} size={24} color="#a29bfe" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactType}>{contact.type}</Text>
                  <Text style={styles.contactValue}>{contact.value}</Text>
                </View>
              </LinearGradient>
            </TVTouchable>
          ))}
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seguinos</Text>
          <View style={styles.socialContainer}>
            <TVTouchable style={styles.socialButton} onPress={() => Linking.openURL('https://www.facebook.com/MaxStreamRadio')}>
              <Ionicons name="logo-facebook" size={30} color="#4267B2" />
            </TVTouchable>
            <TVTouchable style={styles.socialButton} onPress={() => Linking.openURL('https://www.instagram.com/lamaxmaxima/')}>
              <Ionicons name="logo-instagram" size={30} color="#E4405F" />
            </TVTouchable>
            <TVTouchable style={styles.socialButton} onPress={() => Linking.openURL('https://x.com/LaMaxMaxima')}>
              <Ionicons name="logo-twitter" size={30} color="#1DA1F2" />
            </TVTouchable>
            <TVTouchable style={styles.socialButton} onPress={() => Linking.openURL('https://www.youtube.com/@maximafm955ceres')}>
              <Ionicons name="logo-youtube" size={30} color="#FF0000" />
            </TVTouchable>
          </View>
        </View>

        {/* Bottom Space */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  rightSpacer: {
    width: 48,
  },
  logoCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  card: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
    opacity: 0.9,
  },
  programCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  programInfo: {
    marginLeft: 15,
    flex: 1,
  },
  programName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  programTime: {
    fontSize: 14,
    color: '#a29bfe',
  },
  programDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  contactInfo: {
    marginLeft: 15,
    flex: 1,
  },
  contactType: {
    fontSize: 14,
    color: '#a29bfe',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpace: {
    height: 40,
  },
}); 