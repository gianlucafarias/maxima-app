#!/usr/bin/env node

/**
 * Script para restaurar la configuración del keystore después de expo prebuild
 * 
 * Ejecutar después de: npx expo prebuild --clean
 * 
 * Uso: node scripts/restore-keystore-config.js
 */

const fs = require('fs');
const path = require('path');

const BUILD_GRADLE_PATH = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

console.log('🔧 Restaurando configuración de keystore...');

if (!fs.existsSync(BUILD_GRADLE_PATH)) {
  console.error('❌ No se encontró android/app/build.gradle');
  process.exit(1);
}

let buildGradle = fs.readFileSync(BUILD_GRADLE_PATH, 'utf8');

// Verificar si ya tiene la configuración de release
if (buildGradle.includes('MAXIMA_UPLOAD_STORE_FILE') || buildGradle.includes('MYAPP_RELEASE_STORE_FILE')) {
  console.log('✅ La configuración de keystore ya está presente');
  process.exit(0);
}

// Buscar el bloque signingConfigs
const signingConfigsRegex = /(signingConfigs\s*\{[^}]*debug\s*\{[^}]*\})/s;

if (!signingConfigsRegex.test(buildGradle)) {
  console.error('❌ No se encontró el bloque signingConfigs');
  process.exit(1);
}

// Reemplazar signingConfigs para agregar release
const releaseSigningConfig = `
        release {
            // Configuración de keystore de producción
            // Las credenciales se leen desde gradle.properties
            if (project.hasProperty('MAXIMA_UPLOAD_STORE_FILE')) {
                // Keystore debe estar en android/app/ (igual que en develop)
                storeFile file(MAXIMA_UPLOAD_STORE_FILE)
                storePassword MAXIMA_UPLOAD_STORE_PASSWORD
                keyAlias MAXIMA_UPLOAD_KEY_ALIAS
                keyPassword MAXIMA_UPLOAD_KEY_PASSWORD
            }
        }`;

buildGradle = buildGradle.replace(
  /(signingConfigs\s*\{[^}]*debug\s*\{[^}]*\})/s,
  `$1${releaseSigningConfig}`
);

// Buscar y reemplazar el buildType release
const releaseBuildTypeRegex = /(release\s*\{[^}]*signingConfig\s+signingConfigs\.debug[^}]*\})/s;

if (releaseBuildTypeRegex.test(buildGradle)) {
  const newReleaseBuildType = `release {
            // Usar keystore de producción si está configurado
            if (project.hasProperty('MAXIMA_UPLOAD_STORE_FILE')) {
                signingConfig signingConfigs.release
            } else {
                // Fallback a debug solo para desarrollo local
                // ⚠️ NO usar esto para builds de producción
                signingConfig signingConfigs.debug
            }`;

  buildGradle = buildGradle.replace(
    /(release\s*\{[^}]*signingConfig\s+signingConfigs\.debug[^}]*\})/s,
    newReleaseBuildType + `
            shrinkResources (findProperty('android.enableShrinkResourcesInReleaseBuilds')?.toBoolean() ?: false)
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            crunchPngs (findProperty('android.enablePngCrunchInReleaseBuilds')?.toBoolean() ?: true)
        }`
  );
} else {
  // Si no encuentra el patrón exacto, buscar y reemplazar de otra forma
  const releaseTypeMatch = buildGradle.match(/(release\s*\{[^}]*\})/s);
  if (releaseTypeMatch) {
    const oldRelease = releaseTypeMatch[0];
    const newRelease = `release {
            // Usar keystore de producción si está configurado
            if (project.hasProperty('MAXIMA_UPLOAD_STORE_FILE')) {
                signingConfig signingConfigs.release
            } else {
                // Fallback a debug solo para desarrollo local
                // ⚠️ NO usar esto para builds de producción
                signingConfig signingConfigs.debug
            }
            shrinkResources (findProperty('android.enableShrinkResourcesInReleaseBuilds')?.toBoolean() ?: false)
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            crunchPngs (findProperty('android.enablePngCrunchInReleaseBuilds')?.toBoolean() ?: true)
        }`;
    buildGradle = buildGradle.replace(oldRelease, newRelease);
  }
}

fs.writeFileSync(BUILD_GRADLE_PATH, buildGradle, 'utf8');

console.log('✅ Configuración de keystore restaurada exitosamente');
console.log('📝 Recuerda completar las contraseñas en android/gradle.properties');

