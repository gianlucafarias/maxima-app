# Guía de Migración a react-native-tvos

## ✅ Seguridad: NO afecta apps de móvil en producción

**IMPORTANTE**: `react-native-tvos` es **100% compatible** con Android e iOS móviles. Es un fork de React Native que mantiene toda la compatibilidad móvil y agrega soporte para TV.

### Cómo funciona:

1. **Sin `EXPO_TV=1`**: Los builds son **exactamente iguales** a antes - apps móviles normales
2. **Con `EXPO_TV=1`**: Se generan builds específicos para TV (Android TV / Apple TV)

El plugin `@react-native-tvos/config-tv` **solo se activa** cuando la variable de entorno `EXPO_TV=1` está configurada.

---

## 📋 Cambios Realizados

### 1. `package.json`

```json
{
  "dependencies": {
    "react-native": "npm:react-native-tvos@0.79.5-0"
  },
  "expo": {
    "install": {
      "exclude": ["react-native"]
    }
  }
}
```

**¿Qué hace esto?**
- Usa `react-native-tvos` en lugar de `react-native` estándar
- `react-native-tvos` es compatible con móviles - funciona igual
- La exclusión le dice a Expo que no valide la versión de react-native

### 2. `app.json`

Se agregó el plugin:
```json
{
  "plugins": [
    "@react-native-tvos/config-tv",
    // ... otros plugins
  ]
}
```

**¿Qué hace esto?**
- El plugin **solo se activa** cuando `EXPO_TV=1`
- Sin la variable, el plugin no hace nada y los builds son normales de móvil

---

## 🚀 Cómo Construir para Diferentes Plataformas

### Para Apps Móviles (Android/iOS) - PRODUCCIÓN

**NO hagas nada especial** - funciona exactamente igual que antes:

```bash
# Build Android móvil (normal)
npx expo run:android

# Build iOS móvil (normal)
npx expo run:ios

# Prebuild normal (sin TV)
npx expo prebuild
```

**Resultado**: Apps móviles normales, igual que antes. ✅

---

### Para Android TV - DESARROLLO/TESTING

**Solo cuando quieras construir para TV:**

```bash
# 1. Establecer variable de entorno
export EXPO_TV=1    # En Linux/Mac
# O en PowerShell (Windows):
$env:EXPO_TV="1"

# 2. Prebuild con configuración de TV
npx expo prebuild --clean

# 3. Build para Android TV
npx expo run:android
```

**Resultado**: Build específico para Android TV con soporte de control remoto. 📺

---

### Para Apple TV - DESARROLLO/TESTING

```bash
# 1. Establecer variable de entorno
export EXPO_TV=1    # En Linux/Mac
# O en PowerShell (Windows):
$env:EXPO_TV="1"

# 2. Prebuild con configuración de TV
npx expo prebuild --clean

# 3. Build para Apple TV
npx expo run:ios
```

**Resultado**: Build específico para Apple TV. 📺

---

## 🔄 Volver a Builds Móviles Normales

Después de hacer builds de TV, para volver a builds móviles normales:

```bash
# 1. Quitar la variable de entorno (o cerrar la terminal)
unset EXPO_TV    # En Linux/Mac
# O simplemente cerrar PowerShell y abrir uno nuevo en Windows

# 2. Prebuild normal (sin TV)
npx expo prebuild --clean

# 3. Build móvil normal
npx expo run:android
```

---

## 📝 Scripts Recomendados para package.json

Puedes agregar estos scripts para facilitar el proceso:

```json
{
  "scripts": {
    "prebuild": "expo prebuild",
    "prebuild:tv": "cross-env EXPO_TV=1 expo prebuild --clean",
    "android": "expo run:android",
    "android:tv": "cross-env EXPO_TV=1 expo run:android",
    "ios": "expo run:ios",
    "ios:tv": "cross-env EXPO_TV=1 expo run:ios"
  }
}
```

**Nota**: Necesitarías instalar `cross-env` para Windows:
```bash
npm install --save-dev cross-env
```

---

## ✅ Verificación de Seguridad

### Cómo verificar que los builds móviles no cambiaron:

1. **Antes de hacer cambios**: Haz un build móvil normal
2. **Después de instalar react-native-tvos**: Haz otro build móvil normal (sin `EXPO_TV=1`)
3. **Compara**: Deberían ser idénticos

### Cómo verificar que el plugin de TV solo se activa con EXPO_TV=1:

1. **Sin EXPO_TV**: Ejecuta `npx expo prebuild` y revisa los logs - no debería mencionar TV
2. **Con EXPO_TV=1**: Ejecuta `npx expo prebuild` y revisa los logs - debería mencionar configuración de TV

---

## 🎯 Resumen

| Escenario | Variable EXPO_TV | Comando | Resultado |
|-----------|------------------|---------|-----------|
| **Producción Android móvil** | ❌ NO configurada | `npx expo run:android` | App móvil normal ✅ |
| **Producción iOS móvil** | ❌ NO configurada | `npx expo run:ios` | App móvil normal ✅ |
| **Desarrollo Android TV** | ✅ `EXPO_TV=1` | `npx expo prebuild --clean && npx expo run:android` | App Android TV 📺 |
| **Desarrollo Apple TV** | ✅ `EXPO_TV=1` | `npx expo prebuild --clean && npx expo run:ios` | App Apple TV 📺 |

---

## ⚠️ Importante

- **Los builds de producción móvil NO cambian** - funcionan exactamente igual que antes
- **Solo cuando configuras `EXPO_TV=1`** se generan builds de TV
- **react-native-tvos es compatible con móviles** - no hay riesgo de romper nada
- **El plugin solo se activa con la variable** - sin ella, es transparente

---

## 🎮 Navegación con Control Remoto

Con `react-native-tvos`, el sistema nativo maneja automáticamente:

- ✅ **Navegación con flechas**: Las flechas del control remoto mueven el foco automáticamente
- ✅ **Eventos onFocus/onBlur**: Funcionan correctamente sin código adicional
- ✅ **Botón OK/Select**: Activa el elemento enfocado automáticamente
- ✅ **Feedback visual**: El componente `TVTouchable` muestra un borde rojo cuando está enfocado

### Cómo Funciona:

1. **Sistema nativo**: `react-native-tvos` maneja toda la navegación automáticamente
2. **Foco visual**: Nuestro código solo trackea qué elemento está enfocado para mostrar el borde rojo
3. **Sin código manual**: Ya NO necesitamos capturar eventos de teclado manualmente

---

## 🐛 Troubleshooting

### Si un build móvil falla después de la migración:

1. Verifica que NO tengas `EXPO_TV=1` configurada
2. Limpia y reconstruye:
   ```bash
   npx expo prebuild --clean
   npx expo run:android  # o run:ios
   ```

### Si el build de TV no funciona:

1. Verifica que `EXPO_TV=1` esté configurada:
   ```bash
   echo $EXPO_TV    # Linux/Mac
   echo $env:EXPO_TV    # Windows PowerShell
   ```

2. Asegúrate de hacer `prebuild --clean` después de configurar la variable

### Si el foco no se ve en TV:

1. Verifica que estés usando `TVTouchable` en lugar de `TouchableOpacity`
2. Asegúrate de que cada `TVTouchable` tenga un `id` único
3. Revisa los logs para ver si `onFocus` se está disparando:
   ```bash
   adb logcat | findstr "FOCO NATIVO"
   ```

---

## 📚 Referencias

- [Expo Building for TV Guide](https://docs.expo.dev/guides/building-for-tv/)
- [react-native-tvos GitHub](https://github.com/react-native-tvos/react-native-tvos)

