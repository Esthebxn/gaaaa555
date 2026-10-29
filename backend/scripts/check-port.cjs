const net = require('net');

const port = Number(process.env.PORT || 3000);
const server = net.createServer();

server.once('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`El puerto ${port} ya está ocupado. Detén el servicio que lo usa y vuelve a iniciar la API.`);
  } else {
    console.error(`No se pudo comprobar el puerto ${port}: ${error.message}`);
  }
  process.exit(1);
});

server.listen(port, '127.0.0.1', () => {
  server.close(() => console.log(`Puerto ${port} disponible para la API.`));
});
