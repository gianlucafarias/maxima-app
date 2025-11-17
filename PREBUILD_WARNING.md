# ⚠️ ADVERTENCIA: expo prebuild --clean

## 🚨 Problema

Cuando ejecutas `npx expo prebuild --clean`, Expo **regenera todos los archivos nativos** desde cero basándose en `app.json`. Esto significa que **cualquier cambio manual** que hayas hecho en archivos como:

- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml`
- `ios/` (cualquier archivo)

**SE BORRARÁ** y se reemplazará con la configuración por defecto de Expo.

## ✅ Solución: Script de Restauración

He creado un script que restaura automáticamente la configuración del keystore después de cada `prebuild`.

### Uso:

```bash
# 1. Ejecutar prebuild
$env:EXPO_TV="1"
npx expo prebuild --clean

# 2. Restaurar configuración de keystore
node scripts/restore-keystore-config.js
```

### O crear un script combinado:

Crea un archivo `prebuild-tv.ps1`:

```powershell
# Prebuild con TV y restaurar keystore
$env:EXPO_TV="1"
npx expo prebuild --clean
node scripts/restore-keystore-config.js
Write-Host "✅ Prebuild completado y keystore restaurado" -ForegroundColor Green
```

Luego ejecuta: `.\prebuild-tv.ps1`

## 📝 Configuración que se Restaura

El script restaura:

1. **Configuración de keystore de producción** en `android/app/build.gradle`:
   - `signingConfigs.release` con referencia a `gradle.properties`
   - `buildTypes.release` usando el keystore de producción

2. **Verifica** que `android/gradle.properties` tenga:
   ```properties
   MYAPP_RELEASE_STORE_FILE=../maxima-key.keystore
   MYAPP_RELEASE_STORE_PASSWORD=TU_PASSWORD_AQUI
   MYAPP_RELEASE_KEY_ALIAS=maxima-key
   MYAPP_RELEASE_KEY_PASSWORD=TU_PASSWORD_AQUI
   ```

## 🔄 Flujo de Trabajo Recomendado

1. **Primera vez**: Configurar `gradle.properties` con las contraseñas reales
2. **Cada vez que hagas prebuild**:
   ```bash
   $env:EXPO_TV="1"
   npx expo prebuild --clean
   node scripts/restore-keystore-config.js
   ```
3. **Generar build**:
   ```bash
   cd android
   .\gradlew.bat bundleRelease
   ```

## 🛡️ Alternativa: Usar EAS Build

Si usas EAS Build, el keystore se maneja automáticamente y no necesitas preocuparte por esto:

```bash
eas build --platform android --profile production --env EXPO_TV=1
```

## 📚 Más Información

- [Expo Prebuild Docs](https://docs.expo.dev/workflow/prebuild/)
- [Android Signing Config](https://reactnative.dev/docs/signed-apk-android)

