const net = require('net');
const { spawn } = require('child_process');

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const options = { stdio: 'inherit', shell: true };

function portInUse(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => resolve(false));
  });
}

(async () => {
  const processes = [];
  if (await portInUse(3000)) {
    console.log('API existente detectada en http://localhost:3000');
  } else {
    processes.push(spawn(npm, ['--prefix', '../backend', 'run', 'dev'], options));
  }
  processes.push(spawn(npm, ['run', 'dev:client'], options));
  const closeAll = () => processes.forEach((child) => child.kill());
  process.on('SIGINT', () => { closeAll(); process.exit(); });
  process.on('SIGTERM', () => { closeAll(); process.exit(); });
})();
