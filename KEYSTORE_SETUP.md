# 🔐 Configuración de Keystore de Producción

## ❗ Problema Actual

Google Play está rechazando tu bundle porque está firmado con la **debug keystore** en lugar del **keystore de producción** que usaste anteriormente.

**Keystore esperado por Play Store:**
- SHA1: `98:C2:8F:A0:8D:E5:7E:01:1A:73:15:52:7E:AE:66:B6:06:86:7F:E6`

**Keystore actual (debug):**
- SHA1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

## 🔍 Paso 1: Encontrar tu Keystore de Producción

El keystore de producción debe estar en algún lugar seguro. Busca en:

1. **Carpetas de respaldo** (USB, disco externo, cloud)
2. **Documentos del proyecto** anteriores
3. **Android Studio** (si lo usaste antes):
   - `~/.android/` (Linux/Mac)
   - `C:\Users\TU_USUARIO\.android\` (Windows)
4. **EAS Build** (si usaste Expo Application Services):
   - Los keystores se guardan automáticamente en EAS
   - Puedes descargarlo desde: https://expo.dev/accounts/[tu-cuenta]/projects/[tu-proyecto]/credentials

### Verificar SHA1 de un keystore

Si encuentras un keystore, verifica que sea el correcto:

```bash
# Windows PowerShell
keytool -list -v -keystore ruta/al/keystore.keystore -storepass TU_PASSWORD -alias TU_ALIAS | Select-String -Pattern "SHA1"

# Debe mostrar: SHA1: 98:C2:8F:A0:8D:E5:7E:01:1A:73:15:52:7E:AE:66:B6:06:86:7F:E6
```

## 📝 Paso 2: Configurar el Keystore en el Proyecto

### Opción A: Usando gradle.properties (Recomendado)

1. **Crear archivo `android/gradle.properties`** (si no existe) o editarlo
2. **Agregar las siguientes líneas**:

```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_STORE_PASSWORD=tu_password_del_keystore
MYAPP_RELEASE_KEY_ALIAS=tu_key_alias
MYAPP_RELEASE_KEY_PASSWORD=tu_password_de_la_clave
```

3. **Copiar el keystore** a `android/app/my-release-key.keystore`

4. **Verificar que `gradle.properties` está en `.gitignore`** (ya está configurado)

### Opción B: Usando Variables de Entorno

Si prefieres no usar archivos, puedes usar variables de entorno:

```bash
# Windows PowerShell
$env:MYAPP_RELEASE_STORE_FILE="my-release-key.keystore"
$env:MYAPP_RELEASE_STORE_PASSWORD="tu_password"
$env:MYAPP_RELEASE_KEY_ALIAS="tu_alias"
$env:MYAPP_RELEASE_KEY_PASSWORD="tu_password"
```

Luego modifica `android/app/build.gradle` para leer de variables de entorno en lugar de propiedades.

## 🚨 Paso 3: Si NO Tienes el Keystore Original

**⚠️ ADVERTENCIA CRÍTICA**: Si perdiste el keystore de producción, **NO PODRÁS actualizar tu app existente** en Play Store. Tendrías que:

1. **Crear una nueva app** con un nuevo package name
2. **Perder todas las descargas y reviews** existentes
3. **Empezar desde cero** en Play Store

### Recuperar desde EAS (si usaste Expo)

Si usaste EAS Build anteriormente, puedes recuperar el keystore:

```bash
# Instalar EAS CLI si no lo tienes
npm install -g eas-cli

# Login
eas login

# Descargar credenciales
eas credentials -p android
```

### Crear Nuevo Keystore (solo si es nueva app)

Si es una app completamente nueva o aceptas perder la app existente:

```bash
# Generar nuevo keystore
keytool -genkeypair -v -storetype PKCS12 -keystore android/app/my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Guarda las credenciales en un lugar SEGURO** (gestor de contraseñas, caja fuerte, etc.)

## ✅ Paso 4: Verificar Configuración

Después de configurar, verifica que todo esté correcto:

```bash
# Verificar que el keystore existe
ls android/app/my-release-key.keystore

# Verificar SHA1 del keystore configurado
keytool -list -v -keystore android/app/my-release-key.keystore -storepass TU_PASSWORD -alias TU_ALIAS | Select-String -Pattern "SHA1"

# Debe mostrar: SHA1: 98:C2:8F:A0:8D:E5:7E:01:1A:73:15:52:7E:AE:66:B6:06:86:7F:E6
```

## 🔨 Paso 5: Generar Build con Keystore Correcto

Una vez configurado, genera el bundle:

```bash
# Prebuild con TV habilitado
$env:EXPO_TV="1"
npx expo prebuild --clean

# Generar bundle de release
cd android
.\gradlew.bat bundleRelease

# Verificar que el bundle esté firmado correctamente
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab
```

## 📤 Paso 6: Subir a Play Store

Ahora deberías poder subir el bundle sin problemas. El SHA1 debe coincidir con el esperado por Play Store.

## 🔒 Seguridad

- ✅ **NUNCA** commitees `gradle.properties` con contraseñas reales
- ✅ **NUNCA** commitees el archivo `.keystore` (ya está en `.gitignore`)
- ✅ **Guarda** el keystore en múltiples lugares seguros
- ✅ **Usa** un gestor de contraseñas para las credenciales
- ✅ **Considera** usar EAS Build para manejo automático de keystores

## 🆘 Ayuda Adicional

Si sigues teniendo problemas:

1. Verifica que el keystore esté en la ruta correcta
2. Verifica que las contraseñas sean correctas
3. Verifica que el alias sea correcto
4. Revisa los logs de build para errores específicos
5. Consulta la documentación de React Native sobre signing: https://reactnative.dev/docs/signed-apk-android

