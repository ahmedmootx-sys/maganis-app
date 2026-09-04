/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devPort = Number(env.VITE_DEV_PORT || 5173)

  const isProd = mode === 'production'

  return {
    base: isProd ? '/maganis-app/' : './',
    plugins: [react()],
    server: {
      port: devPort,
      strictPort: true,
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/main.tsx',
          'src/**/*.test.*',
          'src/setupTests.ts',
          'src/vite-env.d.ts',
        ],
        thresholds: {
          lines: 70,
          functions: 60,
          branches: 60,
          statements: 70,
        },
      },
    },
  }
})
