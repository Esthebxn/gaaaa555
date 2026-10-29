const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'zoomtv_db',
  port: Number(process.env.DB_PORT || 3306),
  connectTimeout: 30000,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
});

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

global.db = db;

app.use('/api/nosotros', require('./routes/nosotros'));
app.use('/api/noticias', require('./routes/noticias'));
app.use('/api/programacion', require('./routes/programacion'));
app.use('/api/anunciantes', require('./routes/anunciantes'));
app.use('/api/live-stream', require('./routes/live_stream'));
app.use('/api/assistant', require('./routes/assistant'));
app.use('/api/upload', require('./routes/upload'));
app.get('/', (req, res) => res.json({ message: 'API de ZoomTV funcionando correctamente' }));
app.get('/api/health', (req, res) => {
  db.query('SELECT 1', (err) => {
    if (err) return res.status(503).json({ status: 'error', database: 'unavailable', message: err.code || err.message });
    res.json({ status: 'ok', database: 'connected' });
  });
});
const server = app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso. Cierra la instancia anterior de la API antes de iniciar otra.`);
  } else {
    console.error('No fue posible iniciar el servidor:', err.message);
  }
  process.exit(1);
});

module.exports = app;
