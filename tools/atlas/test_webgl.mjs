import http from 'node:http'
import { spawn } from 'node:child_process'

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
      <!DOCTYPE html>
      <html><body>
      <canvas id="c"></canvas>
      <script>
        const canvas = document.getElementById('c');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        const report = {
          supported: !!gl,
          renderer: gl ? gl.getParameter(gl.RENDERER) : null,
          vendor: gl ? gl.getParameter(gl.VENDOR) : null
        };
        fetch('/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
        });
      </script>
      </body></html>
    `)
  } else if (req.url === '/result' && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      console.log('WebGL Test Report from Headless Chrome:', JSON.parse(body))
      res.writeHead(200)
      res.end('OK')
      server.close()
      chrome.kill()
    })
  }
})

server.listen(4891, () => {
  console.log('Server listening on http://localhost:4891')
  chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    '--use-gl=angle',
    '--no-sandbox',
    'http://localhost:4891'
  ])
})

let chrome
