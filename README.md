# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# Máxima FM App

Una aplicación móvil para la radio Máxima FM 95.5, construida con React Native y Expo.

## Características

- 🎵 **Reproducción de audio en vivo** - Transmisión en tiempo real de Máxima FM 95.5
- 📺 **Modo video** - Visualización de contenido de video en vivo y YouTube
- 📱 **Media Controls en segundo plano** - Controles de reproducción desde la pantalla de bloqueo y notificaciones
- 🔔 **Notificaciones push** - Alertas para livestreams y contenido especial
- 🎮 **Interfaz moderna** - Diseño intuitivo con gradientes y animaciones
- 🌙 **Modo background** - El audio continúa reproduciéndose cuando la app está en segundo plano

## Media Controls Background

La aplicación incluye controles de media nativos que permiten controlar la reproducción desde:

### 📱 Notificación Persistente
- Aparece automáticamente cuando el audio se reproduce en segundo plano
- Botones de **Reproducir/Pausar** y **Detener**
- Se actualiza en tiempo real según el estado de reproducción
- Prioridad baja para no ser intrusiva

### 🔧 Implementación Técnica

#### Configuración en `app.json`:
```json
{
  "ios": {
    "infoPlist": {
      "UIBackgroundModes": ["audio", "background-processing"]
    }
  },
  "android": {
    "permissions": [
      "WAKE_LOCK",
      "FOREGROUND_SERVICE"
    ]
  }
}
```

#### Hook `useAudio.ts`:
- Integración con `expo-audio` para reproducción
- Uso de `expo-notifications` para controles nativos
- Gestión automática del estado de reproducción
- Sistema de keep-alive para mantener el audio activo

#### Funcionalidades:
- **Auto-activación**: Los controles aparecen cuando la app va a segundo plano
- **Sincronización**: El estado se mantiene sincronizado entre la app y la notificación
- **Acciones**: Reproducir, pausar y detener desde la notificación
- **Limpieza automática**: La notificación se elimina cuando se detiene la reproducción

### 🎯 Cómo funciona:

1. **Inicio de reproducción**: Se configura la sesión de audio y se activan los controles
2. **Segundo plano**: Automáticamente se crea una notificación persistente con botones
3. **Control remoto**: El usuario puede controlar la reproducción sin abrir la app
4. **Sincronización**: Los cambios se reflejan instantáneamente en la interfaz de la app

### 📝 Limitaciones actuales:

- Los controles nativos de iOS (Centro de Control) requieren bibliotecas adicionales como `react-native-track-player`
- `expo-audio` no incluye soporte nativo para media controls del sistema
- La solución actual usa notificaciones para proporcionar controles básicos

### 🚀 Mejoras futuras:

- Migración a `react-native-track-player` para controles nativos completos
- Integración con Siri y controles por voz
- Visualización de artwork en los controles
- Soporte para controles de Bluetooth y auriculares

## Instalación

```bash
npm install
npx expo start
```

## Construcción

```bash
# Development build
eas build --profile development

# Production build  
eas build --profile production
```

## Configuración

La aplicación requiere configuración de:
- Firebase para notificaciones push
- API de YouTube para contenido de video
- Configuración de streaming URLs

## Tecnologías

- **React Native** con Expo
- **expo-audio** para reproducción de audio
- **expo-notifications** para media controls
- **react-native-webview** para contenido de video
- **Firebase** para notificaciones push
- **TypeScript** para tipado estático
