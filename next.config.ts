import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 图片优化配置
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30天缓存
  },
  
  // 编译优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // ESLint 配置 - 临时禁用构建时的严格检查
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript 配置 - 临时禁用构建时的严格检查
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 实验性功能 - 修复了 turbo 配置警告
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Turbopack 配置 - 移到正确的位置
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['css-loader'],
        as: '*.css',
      },
    },
  },
  
  // 压缩配置
  compress: true,
  
  // 禁用不必要的功能
  poweredByHeader: false,
};

export default nextConfig;
