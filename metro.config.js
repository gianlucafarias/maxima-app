const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Optimizaciones para reducir tamaño del bundle
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    // Configuración agresiva de minificación
    mangle: {
      keep_fnames: true,
    },
    output: {
      comments: false,
    },
    compress: {
      drop_console: true, // Eliminar console.log en producción
    },
  },
};

// Resolver solo las extensiones necesarias
config.resolver = {
  ...config.resolver,
  sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  assetExts: ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'mp3', 'mp4', 'ttf', 'otf'],
};

module.exports = config; 