/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

let gitHash = 'dev'
try {
  gitHash = execSync('git rev-parse --short HEAD').toString().trim()
} catch {
  // fallback
}
const buildTime = new Date().toISOString()
const buildId = `${gitHash}-${buildTime}`

function versionPlugin() {
  return {
    name: 'maganis-version-plugin',
    buildStart() {
      const v = { buildId, gitHash, builtAt: buildTime }
      const pubDir = path.resolve(__dirname, 'public')
      if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true })
      fs.writeFileSync(
        path.join(pubDir, 'version.json'),
        JSON.stringify(v, null, 2) + '\n',
        'utf8',
      )
    },
    closeBundle() {
      const v = { buildId, gitHash, builtAt: buildTime }
      const distDir = path.resolve(__dirname, 'dist')
      if (fs.existsSync(distDir)) {
        fs.writeFileSync(
          path.join(distDir, 'version.json'),
          JSON.stringify(v, null, 2) + '\n',
          'utf8',
        )
        const distSw = path.join(distDir, 'sw.js')
        if (fs.existsSync(distSw)) {
          let content = fs.readFileSync(distSw, 'utf8')
          content = content.replace(/__BUILD_ID__/g, buildId)
          fs.writeFileSync(distSw, content, 'utf8')
        }
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devPort = Number(env.VITE_DEV_PORT || 5173)

  const isProd = mode === 'production'

  return {
    base: isProd ? '/maganis-app/' : './',
    define: {
      __BUILD_ID__: JSON.stringify(buildId),
    },
    plugins: [react(), versionPlugin()],
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
          lines: 45,
          functions: 35,
          branches: 55,
          statements: 45,
        },
      },
    },
  }
})
