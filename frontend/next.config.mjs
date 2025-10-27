/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações de performance
  reactStrictMode: true,
  swcMinify: true,
  
  // Code splitting otimizado
  experimental: {
    optimizePackageImports: ['antd', '@ant-design/icons', 'react-icons'],
  },
  
  // Otimização de imagens
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compressão
  compress: true,
  
  // Otimização de bundle - Removida configuração manual que causa conflito
  // Next.js já gerencia tree shaking automaticamente
};

export default nextConfig;
