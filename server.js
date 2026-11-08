import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve(process.env.STATIC_DIR || resolve(process.cwd(), 'dist'));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json' };
http.createServer(async (req, res) => {
  try {
    const path = resolve(root, decodeURIComponent(new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html'));
    if (!path.startsWith(root + sep) && path !== resolve(root, 'index.html')) throw new Error('not found');
    const data = await readFile(path);
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(process.env.PORT || 3000, '0.0.0.0', () => console.log(`Checkmate Arena running on :${process.env.PORT || 3000}`));
