# ✅ Verificar Keystore de Producción

## Paso 1: Completar Contraseña

Edita `android/gradle.properties` y reemplaza `TU_PASSWORD_AQUI` con la contraseña real de tu keystore:

```properties
MYAPP_RELEASE_STORE_PASSWORD=tu_contraseña_real
MYAPP_RELEASE_KEY_PASSWORD=tu_contraseña_real
```

## Paso 2: Verificar SHA1

Una vez que tengas la contraseña configurada, verifica que el SHA1 coincida con el esperado por Play Store:

```powershell
# Verificar SHA1 del keystore
keytool -list -v -keystore android/maxima-key.keystore -storepass TU_PASSWORD -alias maxima-key | Select-String -Pattern "SHA1"
```

**SHA1 Esperado por Play Store:**
```
98:C2:8F:A0:8D:E5:7E:01:1A:73:15:52:7E:AE:66:B6:06:86:7F:E6
```

Si el SHA1 coincide, ¡estás listo para generar el build!

## Paso 3: Generar Build

```powershell
# Prebuild con TV habilitado
$env:EXPO_TV="1"
npx expo prebuild --clean

# Generar bundle de release
cd android
.\gradlew.bat bundleRelease
```

El bundle estará en: `android/app/build/outputs/bundle/release/app-release.aab`

## Paso 4: Verificar Firma del Bundle

Antes de subir, verifica que el bundle esté firmado correctamente:

```powershell
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab
```

Si todo está bien, deberías poder subirlo a Play Store sin problemas.

