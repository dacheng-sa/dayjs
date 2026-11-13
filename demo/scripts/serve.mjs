// Tiny static server for dist/<variant> (ES modules can't load from file://).
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' }
export function serve(dir) {
  const server = createServer(async (req, res) => {
    const path = normalize(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html'
    try {
      const body = await readFile(join(dir, path))
      res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' })
      res.end(body)
    } catch {
      res.writeHead(404).end()
    }
  })
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r({ server, url: `http://127.0.0.1:${server.address().port}/` })))
}
