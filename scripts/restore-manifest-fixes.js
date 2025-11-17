#!/usr/bin/env node

/**
 * Script para restaurar correcciones del AndroidManifest después de expo prebuild
 * 
 * Ejecutar después de: npx expo prebuild --clean
 * 
 * Uso: node scripts/restore-manifest-fixes.js
 */

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');

console.log('🔧 Restaurando correcciones del AndroidManifest...');

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error('❌ No se encontró android/app/src/main/AndroidManifest.xml');
  process.exit(1);
}

let manifest = fs.readFileSync(MANIFEST_PATH, 'utf8');

// Verificar si ya tiene las correcciones
if (manifest.includes('tools:replace="android:value"') && manifest.includes('tools:replace="android:resource"')) {
  console.log('✅ Las correcciones del manifest ya están presentes');
  process.exit(0);
}

// Agregar tools:replace a los meta-data de Firebase
// Línea 1: default_notification_channel_id
manifest = manifest.replace(
  /(<meta-data android:name="com\.google\.firebase\.messaging\.default_notification_channel_id" android:value="default")\/>/,
  '$1 tools:replace="android:value"/>'
);

// Línea 2: default_notification_color
manifest = manifest.replace(
  /(<meta-data android:name="com\.google\.firebase\.messaging\.default_notification_color" android:resource="@color\/notification_icon_color")\/>/,
  '$1 tools:replace="android:resource"/>'
);

fs.writeFileSync(MANIFEST_PATH, manifest, 'utf8');

console.log('✅ Correcciones del AndroidManifest restauradas exitosamente');

