/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/images/**',
      },
    ],
  },
  // Configuración de webpack para optimizar Fast Refresh
  webpack: (config, { dev, isServer }) => {
    // Solo aplicar en desarrollo y no en el servidor
    if (dev && !isServer) {
      // Aumentar tiempo mínimo entre reconstrucciones
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 300, // Esperar este tiempo después de cambios antes de reconstruir
        poll: false, // Usar sistema de notificación nativo del sistema de archivos
        ignored: /node_modules/, // Ignorar node_modules para reducir reconstrucciones
      };
    }

    // Agregar alias para @/ y @/prisma
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname),
      '@/prisma': path.join(__dirname, 'prisma'),
    };

    return config;
  },
}

module.exports = nextConfig 