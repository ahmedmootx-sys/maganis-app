import { preview } from 'vite'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const server = await preview({
  root: rootDir,
  preview: { port: 4173, strictPort: false },
  logLevel: 'error',
})

const port = server.httpServer.address().port
const baseUrl = `http://localhost:${port}/maganis-app/`

const child = spawn(process.execPath, ['qa/video-flow.mjs'], {
  cwd: rootDir,
  env: { ...process.env, BASE: baseUrl },
  stdio: 'inherit',
})

child.on('exit', (code) => {
  server.httpServer.close(() => {
    process.exit(code ?? 0)
  })
})
