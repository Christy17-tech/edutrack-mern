const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data/db');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Find binary in cache
const cacheDir = path.join(__dirname, '../../node_modules/.cache/mongodb-memory-server');
const files = fs.existsSync(cacheDir) ? fs.readdirSync(cacheDir) : [];
const binaryName = files.find((f) => f.startsWith('mongod'));

if (!binaryName) {
  console.error('[MongoDB Launcher] mongod binary not found in node_modules cache.');
  process.exit(1);
}

const binaryPath = path.join(cacheDir, binaryName);
console.log(`[MongoDB Launcher] Starting local MongoDB server on port 27017...`);
console.log(`[MongoDB Launcher] Data storage directory: ${dataDir}`);

const proc = spawn(binaryPath, ['--dbpath', dataDir, '--port', '27017', '--bind_ip', '127.0.0.1'], {
  stdio: 'inherit',
});

proc.on('error', (err) => {
  console.error('[MongoDB Launcher] Failed to start mongod:', err.message);
});

proc.on('close', (code) => {
  console.log(`[MongoDB Launcher] MongoDB process stopped with exit code ${code}`);
});

process.on('SIGINT', () => {
  console.log('\n[MongoDB Launcher] Gracefully shutting down MongoDB...');
  proc.kill('SIGINT');
});
