# Guía de Android TV para Máxima FM App

Esta guía explica cómo preparar, compilar y probar la app en Android TV.

## 📋 Requisitos

- Android Studio con Android TV SDK instalado
- Dispositivo Android TV físico o emulador
- ADB (Android Debug Bridge) configurado
- Node.js y npm/yarn instalados

## 🚀 Compilar para Android TV

### Opción 1: Usando Expo Dev Client

```bash
# Instalar dependencias
npm install

# Generar build de desarrollo para Android
npx expo run:android
```

### Opción 2: Build de Producción con EAS

```bash
# Instalar EAS CLI si no lo tienes
npm install -g eas-cli

# Login en tu cuenta Expo
eas login

# Crear build de producción
eas build --platform android --profile production
```

## 📺 Configurar Emulador de Android TV

1. Abre Android Studio
2. Ve a **Tools** > **AVD Manager**
3. Click en **Create Virtual Device**
4. Selecciona la categoría **TV**
5. Elige un dispositivo (ej: "Android TV (1080p)")
6. Selecciona una imagen del sistema (recomendado: Android API 31+)
7. Click **Finish**

### Iniciar el emulador:

```bash
# Lista los emuladores disponibles
emulator -list-avds

# Inicia el emulador (reemplaza <avd_name> con el nombre de tu AVD)
emulator -avd <avd_name>
```

## 🔌 Conectar Dispositivo Android TV Físico

### Por USB:

```bash
# Conecta el TV por USB y verifica la conexión
adb devices

# Instala la APK
adb install app-release.apk
```

### Por Red (WiFi):

1. En tu Android TV:
   - Ve a **Configuración** > **Acerca de**
   - Busca la dirección IP (ej: 192.168.1.100)
   - Activa **Opciones de desarrollador** tocando 7 veces en "Build"
   - Activa **Depuración por ADB** en Opciones de desarrollador

2. En tu computadora:

```bash
# Conecta por red (reemplaza con la IP de tu TV)
adb connect 192.168.1.100:5555

# Verifica la conexión
adb devices

# Instala la app
adb install -r app-release.apk

# O ejecuta directamente desde Expo
npx expo run:android --device
```

## 🎮 Navegación con Control Remoto

### Teclas del Control Remoto:

- **D-Pad** (Arriba/Abajo/Izquierda/Derecha): Navegar entre elementos
- **OK/Select**: Confirmar/Activar elemento
- **Back**: Volver atrás
- **Home**: Ir al inicio de Android TV
- **Play/Pause**: Controlar reproducción

### Simulación en Emulador:

- Usa las **teclas de dirección** del teclado
- **Enter**: Botón OK/Select
- **ESC**: Botón Back
- **Espacio**: Play/Pause

## ✅ Checklist de Pruebas

### Navegación:
- [ ] El foco se mueve correctamente con las direcciones
- [ ] El elemento enfocado se resalta claramente
- [ ] El botón OK/Select activa el elemento enfocado
- [ ] El botón Back navega correctamente

### Reproducción de Audio:
- [ ] El stream de radio se reproduce correctamente
- [ ] Los controles remotos (Play/Pause/Stop) funcionan
- [ ] El audio continúa en background
- [ ] Las notificaciones de media se muestran correctamente

### Reproducción de Video:
- [ ] Los videos de YouTube se reproducen
- [ ] El stream de Twitch funciona
- [ ] El botón "Volver al Live" funciona
- [ ] El video se ve correctamente en pantalla completa

### UI/UX:
- [ ] Los textos son legibles desde la distancia (tamaño apropiado)
- [ ] No hay elementos cortados (overscan respetado)
- [ ] Los colores se ven correctos
- [ ] Las animaciones son fluidas
- [ ] No hay glitches visuales

### Funcionalidad:
- [ ] Las noticias se cargan correctamente
- [ ] Los videos de YouTube RSS se muestran
- [ ] Los livestreams se detectan
- [ ] El botón de WhatsApp funciona (si aplica en TV)
- [ ] La pantalla de info se muestra correctamente

## 🐛 Debugging

### Ver logs en tiempo real:

```bash
# Ver todos los logs de la app
adb logcat | grep -i "maxima"

# Filtrar por tag específico
adb logcat | grep "TrackPlayer"
adb logcat | grep "TV Remote"
```

### Información del dispositivo:

```bash
# Ver información del sistema
adb shell getprop

# Verificar si es TV
adb shell getprop ro.build.characteristics
# Debería incluir "tv"
```

## 🎯 Optimizaciones para TV

### Implementadas:

1. **Detección automática de TV**: Usando `Platform.isTV`
2. **Estilos adaptados**: Tamaños de texto y botones más grandes
3. **Navegación por foco**: Componente `TVTouchable` con resaltado
4. **Márgenes de seguridad**: Overscan respetado en layouts
5. **Controles remotos**: Integrados con TrackPlayer
6. **Manifest configurado**: `LEANBACK_LAUNCHER` y features opcionales

### Recomendaciones adicionales:

- Probar en múltiples resoluciones (720p, 1080p, 4K)
- Validar rendimiento en TVs más antiguas
- Considerar modo de alto contraste para mejor legibilidad
- Implementar shortcuts de teclado si es necesario

## 📱 Compatibilidad Móvil

Los cambios implementados **NO afectan** las versiones móviles:

- Todos los estilos de TV están condicionados con `Platform.isTV`
- Los componentes funcionan en ambas plataformas
- El manifest tiene features TV marcadas como opcionales
- La orientación se ajusta automáticamente según dispositivo

## 🔄 Actualizar la App

```bash
# Desarrollo: Hot reload funciona automáticamente en el emulador

# Producción: Reinstalar la APK
adb uninstall com.maximaceres.app
adb install app-release.apk
```

## 📞 Soporte

Si encuentras problemas específicos de TV:

1. Verifica los logs con `adb logcat`
2. Comprueba que el manifest incluya las configuraciones de TV
3. Asegúrate de que `Platform.isTV` devuelve `true`
4. Revisa que los componentes `TVTouchable` estén siendo usados

## 🎉 Resultado Esperado

Al ejecutar la app en Android TV deberías ver:

- ✅ Logo de la app en el launcher de TV
- ✅ Interfaz adaptada con textos más grandes
- ✅ Navegación fluida con el control remoto
- ✅ Reproducción de audio/video funcional
- ✅ Controles remotos integrados con la reproducción
- ✅ UI sin elementos cortados (overscan correcto)

