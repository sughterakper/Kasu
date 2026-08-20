/* Tiny static server for the Kasua demo — no dependencies.
   Run:  node serve.js        then open http://localhost:5173 */
const http = require('http');
const fs = require('fs');
const path = require('path');

/* The site lives at the repo root so GitHub Pages serves it from the bare URL,
   which means this server has to refuse the repo's own plumbing. */
const ROOT = __dirname;
const PORT = process.env.PORT || 5173;
const BLOCKED = /(^|[\\/])(\.git|\.claude|node_modules|serve\.js)([\\/]|$)/i;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const rel = path.normalize(p).replace(/^([/\\])+/, '');
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || BLOCKED.test(rel)) { res.writeHead(403).end('forbidden'); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('not found'); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      // dev server: never cache, so edits show up on a plain reload
      'Cache-Control': 'no-store, must-revalidate'
    });
    res.end(buf);
  });
}).listen(PORT, () => console.log(`Kasua demo running at http://localhost:${PORT}`));
