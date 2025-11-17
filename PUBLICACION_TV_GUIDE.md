# 📺 Guía de Publicación para Android TV

## ✅ Estado Actual

- ✅ Código completo para Android TV implementado
- ✅ Soporte para navegación con control remoto
- ✅ Modo Video por defecto en TV
- ✅ Autoplay para Twitch habilitado
- ✅ Pantalla completa funcionando
- ✅ Compatible con móviles (sin cambios)

## 📋 Pasos para Publicar

### 1. Verificar Funcionalidad Completa

Antes de publicar, probar en TV real y emulador:

- [ ] Navegación con flechas del control remoto funciona en todos los elementos
- [ ] Botón OK activa elementos correctamente
- [ ] Modo Video inicia por defecto en TV
- [ ] Twitch se reproduce automáticamente (autoplay)
- [ ] YouTube Live se detecta y reproduce correctamente
- [ ] Pantalla completa funciona (click en reproductor)
- [ ] Botón salir de pantalla completa funciona
- [ ] Scroll automático en noticias y videos funciona
- [ ] Móviles siguen funcionando normalmente (sin regresiones)

### 2. Actualizar Versiones

#### En `app.json`:
- Versión actual: `1.0.8`
- Nueva versión sugerida: `1.0.9` (o `1.1.0` si prefieres un cambio mayor)

#### En `android/app/build.gradle`:
- `versionCode`: Incrementar (actualmente es `1`, cambiar a `2` o mayor)
- `versionName`: Debe coincidir con `app.json` (`1.0.9`)

### 3. Generar Build para Producción

#### Opción A: Build Local (sin EAS)

```bash
# Asegurarse de estar en la rama correcta
git checkout feature/android-tv-support

# Prebuild con configuración de TV
$env:EXPO_TV="1"
npx expo prebuild --clean

# Generar AAB (Android App Bundle) para Play Store
cd android
.\gradlew.bat bundleRelease

# El archivo estará en:
# android/app/build/outputs/bundle/release/app-release.aab
```

**⚠️ IMPORTANTE**: Necesitas tener configurado tu keystore de producción. Si usas `signingConfigs.debug`, el AAB no será aceptado por Play Store.

#### Opción B: Build con EAS (si tienes cuenta)

```bash
# Build para producción con TV habilitado
eas build --platform android --profile production --env EXPO_TV=1
```

### 4. Configurar Keystore de Producción (si no lo tienes)

Si es la primera vez que publicas o necesitas crear un keystore:

```bash
# Generar keystore
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Guardar las credenciales de forma segura
# Configurar en android/app/build.gradle:
# signingConfigs {
#   release {
#     storeFile file('my-release-key.keystore')
#     storePassword 'TU_PASSWORD'
#     keyAlias 'my-key-alias'
#     keyPassword 'TU_PASSWORD'
#   }
# }
```

### 5. Subir a Google Play Console

1. **Acceder a Play Console**: https://play.google.com/console
2. **Seleccionar tu app**: "La Max Stream Radio"
3. **Ir a Producción** → **Crear nueva versión**
4. **Subir el archivo `.aab`** generado
5. **Completar información de la versión**:
   - Notas de la versión: "Soporte para Android TV - Navegación con control remoto - Modo Video por defecto"
   - Cambios: Listar mejoras de TV

### 6. Configurar Android TV en Play Console

1. **Ir a la sección "Dispositivos"** → **TV**
2. **Completar información de TV**:
   - **Banner de TV**: Imagen de 1280x720px (ya configurado en manifest)
   - **Capturas de pantalla**: Tomar desde la TV o emulador
     - Pantalla principal (modo Video)
     - Pantalla de noticias
     - Pantalla de videos
     - Pantalla completa del reproductor
   - **Descripción para TV**: Adaptar descripción para usuarios de TV
   - **Categoría**: Música y Audio / Radio

3. **Verificar requisitos de TV**:
   - ✅ Leanback launcher configurado
   - ✅ Banner configurado
   - ✅ Features opcionales configuradas (touchscreen=false)

### 7. Revisión y Publicación

1. **Revisar todos los campos** en Play Console
2. **Enviar a revisión**
3. **Esperar aprobación** (típicamente 1-3 días)
4. **Publicar** cuando esté aprobado

## 🔄 Builds Separados (Opcional)

Si prefieres tener builds separados para móvil y TV:

### Build para Móvil (sin TV):
```bash
# Sin EXPO_TV
npx expo prebuild --clean
cd android
.\gradlew.bat bundleRelease
```

### Build para TV:
```bash
# Con EXPO_TV=1
$env:EXPO_TV="1"
npx expo prebuild --clean
cd android
.\gradlew.bat bundleRelease
```

**Nota**: Con la configuración actual, el mismo build funciona para ambos, así que no es necesario separarlos.

## 📝 Checklist Final

- [ ] Versiones actualizadas en `app.json` y `build.gradle`
- [ ] Build de producción generado (`.aab`)
- [ ] Keystore de producción configurado
- [ ] Build probado en TV real
- [ ] Build probado en móvil (verificar que no rompió nada)
- [ ] AAB subido a Play Console
- [ ] Información de TV completada en Play Console
- [ ] Capturas de pantalla de TV agregadas
- [ ] Notas de versión escritas
- [ ] Enviado a revisión

## 🚨 Consideraciones Importantes

1. **Keystore**: Si ya tienes una app publicada, DEBES usar el mismo keystore. Si lo pierdes, no podrás actualizar la app.

2. **Version Code**: Debe ser mayor que la versión anterior en Play Store. Si tu última versión tenía `versionCode: 5`, esta debe ser `6` o mayor.

3. **Testing**: Probar exhaustivamente en TV real antes de publicar. Los emuladores pueden comportarse diferente.

4. **Rollback**: Si algo sale mal, puedes hacer rollback desde Play Console a la versión anterior.

## 📞 Soporte

Si encuentras problemas durante la publicación:
- Revisar logs de build
- Verificar configuración de keystore
- Consultar documentación de Play Console
- Verificar que todas las imágenes de TV estén en formato correcto

