const { spawn, execFileSync } = require('child_process');
const net = require('net');
const path = require('path');

const root = path.resolve(__dirname, '..');
const services = [
  {
    name: 'API ZoomTV',
    port: 3000,
    directory: 'backend',
    entry: 'node_modules/nodemon/bin/nodemon.js',
    args: ['server.js'],
    env: { PORT: '3000' },
  },
  {
    name: 'Web pública',
    port: 3002,
    directory: 'Zoomtv2.0respaldo',
    entry: 'node_modules/vite/bin/vite.js',
    args: ['--host', '0.0.0.0', '--port', '3002', '--strictPort'],
  },
  {
    name: 'Dashboard CMS',
    port: 3005,
    directory: 'mysql_cms',
    entry: 'node_modules/vite/bin/vite.js',
    args: ['--host', '0.0.0.0', '--port', '3005', '--strictPort'],
  },
];

const children = [];
let stopping = false;

function stopAll(exitCode = 0) {
  if (stopping) return;
  stopping = true;

  for (const child of children) {
    if (!child.pid || child.exitCode !== null) continue;
    try {
      if (process.platform === 'win32') {
        execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      } else {
        child.kill('SIGTERM');
      }
    } catch {
      // El servicio pudo haber terminado justo antes de cerrar el resto.
    }
  }

  process.exitCode = exitCode;
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));

function portIsInUse(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    socket.setTimeout(700);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}

async function startAll() {
  console.log('\nZoomTV:');
  for (const service of services) {
    if (await portIsInUse(service.port)) {
      console.log(`  ${service.name}: el puerto ${service.port} ya está ocupado; se conserva el servicio existente.`);
      continue;
    }

    const cwd = path.join(root, service.directory);
    const entry = path.join(cwd, service.entry);
    const child = spawn(process.execPath, [entry, ...service.args], {
      cwd,
      env: { ...process.env, ...service.env },
      stdio: 'inherit',
    });

    children.push(child);
    child.once('error', (error) => {
      console.error(`[${service.name}] No se pudo iniciar: ${error.message}`);
      stopAll(1);
    });
    child.once('exit', (code) => {
      if (!stopping) {
        console.error(`[${service.name}] Terminó${code === 0 ? '.' : ` con código ${code}.`}`);
        stopAll(code === 0 ? 0 : code || 1);
      }
    });
  }

  console.log('\nDirecciones:');
  console.log('  Web pública: http://localhost:3002');
  console.log('  Dashboard:   http://localhost:3005');
  console.log('  API/health:  http://localhost:3000/api/health');
  if (!children.length) {
    console.log('\nLos tres servicios ya están iniciados. No se abrió ninguna instancia duplicada.');
    return;
  }
  console.log('\nPresiona Ctrl+C para detener los servicios iniciados por este comando.\n');
}

startAll().catch((error) => {
  console.error(`No se pudo iniciar ZoomTV: ${error.message}`);
  stopAll(1);
});
