import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const root = new URL('..', import.meta.url);
const port = Number(process.env.PORT ?? 4173);
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
]);

async function loadAsset(pathname) {
  const file = pathname === '/' ? 'index.html' : pathname.slice(1);
  return readFile(new URL(file, root));
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const body = await loadAsset(url.pathname);
    const type = mimeTypes.get(extname(url.pathname) || '.html') ?? 'application/octet-stream';
    res.writeHead(200, { 'content-type': type });
    res.end(body);
  } catch {
    const body = await readFile(resolve(new URL('.', root).pathname, 'index.html'));
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body);
  }
}).listen(port, () => {
  console.log(`Neutralino experiment preview running at http://localhost:${port}`);
});
