// Configuración de Firebase para notificaciones push
export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const DASHBOARD_BASE_URL = process.env.EXPO_PUBLIC_NOTIFICATIONS_BASE_URL || '';
const DASHBOARD_REGISTER_ENDPOINT = process.env.EXPO_PUBLIC_NOTIFICATIONS_REGISTER_ENDPOINT || '/api/register-device';
const DASHBOARD_SEND_ENDPOINT = process.env.EXPO_PUBLIC_NOTIFICATIONS_SEND_ENDPOINT || '/api/send-notification';
const DASHBOARD_STATS_ENDPOINT = process.env.EXPO_PUBLIC_NOTIFICATIONS_STATS_ENDPOINT || '/api/stats';

// URL del dashboard para registro de dispositivos
export const DASHBOARD_CONFIG = {
  baseUrl: DASHBOARD_BASE_URL,
  endpoints: {
    registerDevice: DASHBOARD_REGISTER_ENDPOINT,
    sendNotification: DASHBOARD_SEND_ENDPOINT,
    getStats: DASHBOARD_STATS_ENDPOINT
  }
};

// Configuración de la app actualizada
export const APP_CONFIG = {
  name: "La Max 95.5 APP",
  package: {
    android: "com.maximaceres.app",
    ios: "com.maximaceres.app"
  },
  version: "1.0.0"
};

// Tipos de notificaciones que puedes enviar desde tu dashboard
export const NOTIFICATION_TYPES = {
  LIVE_STREAM: 'live_stream',        // 🔴 Transmisión en vivo iniciada
  NEW_PROGRAM: 'new_program',        // 📺 Nuevo programa disponible
  SPECIAL_EVENT: 'special_event',    // 🎉 Evento especial 
  BREAKING_NEWS: 'breaking_news',    // 🚨 Noticia de última hora
  PROGRAM_REMINDER: 'program_reminder', // ⏰ Recordatorio de programa
  URGENT: 'urgent',                  // ⚠️ Mensaje urgente
  GENERAL: 'general'                 // 📱 Mensaje general
};

// Configuración de categorías para el dashboard
export const NOTIFICATION_CATEGORIES = [
  {
    id: 'urgent',
    name: 'Urgente',
    description: 'Mensajes de máxima prioridad',
    color: '#ff4757',
    sound: 'default',
    priority: 'high',
    vibration: [0, 100, 100, 100, 100, 100],
    examples: [
      'Transmisión interrumpida',
      'Comunicado importante',
      'Emergencia informativa'
    ]
  },
  {
    id: 'live',
    name: 'En Vivo',
    description: 'Notificaciones de transmisiones en directo',
    color: '#ff6b6b', 
    sound: 'default',
    priority: 'high',
    vibration: [0, 250, 250, 250],
    examples: [
      '🔴 Máxima FM en vivo ahora!',
      'Transmisión especial iniciada',
      'Live desde el estudio'
    ]
  },
  {
    id: 'program',
    name: 'Programas',
    description: 'Nuevos contenidos y programas',
    color: '#6c5ce7',
    sound: 'default', 
    priority: 'normal',
    vibration: [0, 250],
    examples: [
      'Nuevo episodio disponible',
      'Programa destacado de la semana',
      'Entrevista exclusiva subida'
    ]
  },
  {
    id: 'general',
    name: 'General',
    description: 'Información general de la radio',
    color: '#a29bfe',
    sound: 'default',
    priority: 'normal',
    vibration: [0, 250],
    examples: [
      'Cambios en la programación',
      'Concursos y promociones', 
      'Saludo de fin de semana'
    ]
  }
];

// Plantillas predefinidas para el dashboard
export const NOTIFICATION_TEMPLATES = [
  {
    id: 'live_start',
    category: 'live',
    title: '🔴 Máxima FM EN VIVO',
    body: '¡Estamos transmitiendo en directo! Únete ahora.',
    data: { type: 'live_stream', action: 'open_live' }
  },
  {
    id: 'new_video',
    category: 'program', 
    title: '📺 Nuevo Video',
    body: 'Acabamos de subir contenido nuevo. ¡No te lo pierdas!',
    data: { type: 'new_program', action: 'open_videos' }
  },
  {
    id: 'morning_greeting',
    category: 'general',
    title: '☀️ Buenos días',
    body: '¡Que tengas un excelente día con Máxima FM!',
    data: { type: 'general', action: 'open_app' }
  },
  {
    id: 'special_event',
    category: 'urgent',
    title: '🎉 Evento Especial',
    body: 'No te pierdas nuestro evento especial de hoy.',
    data: { type: 'special_event', action: 'open_live' }
  }
];

// Horarios recomendados para envío de notificaciones
export const NOTIFICATION_SCHEDULE = {
  morning: {
    start: '07:00',
    end: '11:00',
    description: 'Horario matutino - Buenos días'
  },
  afternoon: {
    start: '12:00', 
    end: '17:00',
    description: 'Horario vespertino - Programas principales'
  },
  evening: {
    start: '18:00',
    end: '22:00', 
    description: 'Horario nocturno - Contenido especial'
  },
  avoid: {
    start: '23:00',
    end: '06:00',
    description: 'Evitar notificaciones nocturnas'
  }
}; 