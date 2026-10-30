const fs = require('node:fs');
const path = require('node:path');

const backend = String(process.env.AUCTION_BACKEND_URL || '').trim().replace(/\/+$/, '');
if (!/^https:\/\//i.test(backend)) {
  throw new Error('Set AUCTION_BACKEND_URL to the HTTPS URL of the deployed Render backend.');
}

const publicDir = path.join(__dirname, 'public');
fs.writeFileSync(path.join(publicDir, 'runtime-config.js'), `window.AUCTION_BACKEND_URL = ${JSON.stringify(backend)};\n`, 'utf8');

const socketClient = path.join(__dirname, 'node_modules', 'socket.io', 'client-dist', 'socket.io.min.js');
const socketOutput = path.join(publicDir, 'socket.io', 'socket.io.js');
fs.mkdirSync(path.dirname(socketOutput), { recursive: true });
fs.copyFileSync(socketClient, socketOutput);
