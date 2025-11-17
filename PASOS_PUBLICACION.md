# 📋 Pasos para Publicar la App en Android TV

## ✅ Configuración Actual

- ✅ Keystore configurado: `maxima-key.keystore`
- ✅ Contraseñas completadas en `android/gradle.properties`
- ✅ Script de restauración automática creado

## 🚀 Flujo de Trabajo Completo

### Paso 1: Prebuild con TV (usando script automático)

**IMPORTANTE**: Usa el script que creamos para que NO se borre la configuración:

```powershell
.\prebuild-tv.ps1
```

Este script:
1. Ejecuta `expo prebuild --clean` con `EXPO_TV=1`
2. **Restaura automáticamente** la configuración del keystore
3. Te avisa si falta algo

**O manualmente:**

```powershell
# 1. Prebuild
$env:EXPO_TV="1"
npx expo prebuild --clean

# 2. Restaurar keystore (IMPORTANTE: siempre después de prebuild)
node scripts/restore-keystore-config.js
```

### Paso 2: Verificar que el keystore esté correcto

```powershell
# Verificar SHA1 del keystore
keytool -list -v -keystore android/maxima-key.keystore -storepass 39660037 -alias maxima-key | Select-String -Pattern "SHA1"
```

**Debe mostrar:**
```
SHA1: 98:C2:8F:A0:8D:E5:7E:01:1A:73:15:52:7E:AE:66:B6:06:86:7F:E6
```

Si coincide, ¡perfecto! Si no, necesitas usar el keystore correcto.

### Paso 3: Generar el Bundle (AAB)

```powershell
cd android
.\gradlew.bat bundleRelease
```

El archivo estará en:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Paso 4: Verificar la Firma del Bundle

Antes de subir, verifica que esté firmado correctamente:

```powershell
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab
```

Si dice "jar verified", está bien firmado.

### Paso 5: Subir a Google Play Console

1. Accede a [Google Play Console](https://play.google.com/console)
2. Selecciona tu app: "La Max Stream Radio"
3. Ve a **Producción** → **Crear nueva versión**
4. Sube el archivo `app-release.aab`
5. Completa las notas de versión
6. Envía a revisión

## 🔄 Si Necesitas Hacer Cambios y Volver a Prebuild

**SIEMPRE usa el script:**

```powershell
.\prebuild-tv.ps1
```

O manualmente:

```powershell
$env:EXPO_TV="1"
npx expo prebuild --clean
node scripts/restore-keystore-config.js  # ← NO OLVIDES ESTE PASO
```

## ⚠️ Qué NO Hacer

❌ **NO ejecutes solo `npx expo prebuild --clean`** sin restaurar el keystore después
❌ **NO edites `build.gradle` manualmente** antes de ejecutar el script de restauración
❌ **NO commitees `gradle.properties`** con contraseñas reales (ya está en `.gitignore`)

## ✅ Qué SÍ Hacer

✅ **SIEMPRE usa `.\prebuild-tv.ps1`** o restaura manualmente después de prebuild
✅ **Verifica el SHA1** antes de generar el build
✅ **Guarda el keystore** en un lugar seguro (backup)
✅ **Prueba el build** en TV real antes de publicar

## 📝 Checklist Antes de Publicar

- [ ] Ejecuté `.\prebuild-tv.ps1` o restauré el keystore manualmente
- [ ] Verifiqué que el SHA1 del keystore coincida con Play Store
- [ ] Generé el bundle con `.\gradlew.bat bundleRelease`
- [ ] Verifiqué la firma del bundle con `jarsigner -verify`
- [ ] Probé el build en TV real
- [ ] Probé el build en móvil (verificar que no rompió nada)
- [ ] Subí el bundle a Play Console
- [ ] Completé información de TV en Play Console

## 🆘 Si Algo Sale Mal

1. **Error de firma**: Verifica que el SHA1 coincida
2. **Keystore no encontrado**: Verifica que `maxima-key.keystore` esté en `android/`
3. **Contraseña incorrecta**: Verifica `gradle.properties`
4. **Configuración borrada**: Ejecuta `node scripts/restore-keystore-config.js`

## 📞 Resumen Rápido

```powershell
# Para hacer cambios y regenerar:
.\prebuild-tv.ps1

# Para generar build de producción:
cd android
.\gradlew.bat bundleRelease

# El AAB estará en:
# android/app/build/outputs/bundle/release/app-release.aab
```

