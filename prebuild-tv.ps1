# Script para prebuild con TV y restaurar configuración de keystore
# Uso: .\prebuild-tv.ps1

Write-Host "🚀 Iniciando prebuild con soporte TV..." -ForegroundColor Cyan

# Configurar variable de entorno para TV
$env:EXPO_TV = "1"

# Ejecutar prebuild
Write-Host "📦 Ejecutando expo prebuild --clean..." -ForegroundColor Yellow
npx expo prebuild --clean

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en prebuild" -ForegroundColor Red
    exit 1
}

# Restaurar configuración de keystore
Write-Host "🔧 Restaurando configuración de keystore..." -ForegroundColor Yellow
node scripts/restore-keystore-config.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error restaurando keystore" -ForegroundColor Red
    exit 1
}

# Restaurar correcciones del AndroidManifest
Write-Host "🔧 Restaurando correcciones del AndroidManifest..." -ForegroundColor Yellow
node scripts/restore-manifest-fixes.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error restaurando manifest" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prebuild completado y keystore restaurado" -ForegroundColor Green
Write-Host "📝 Recuerda completar las contraseñas en android/gradle.properties si aún no lo hiciste" -ForegroundColor Yellow

