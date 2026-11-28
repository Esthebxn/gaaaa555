const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const { requireAdmin, login } = require('./middleware/adminAuth');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const uploadDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
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

// Keep the production site usable when the host has not yet received its
// CORS_ORIGINS setting. Set CORS_ORIGINS to override this allowlist.
const defaultOrigins = ['https://zoomtv-web.vercel.app'];
const allowedOrigins = (process.env.CORS_ORIGINS || defaultOrigins.join(','))
  .split(',').map((origin) => origin.trim()).filter(Boolean);
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3002', 'http://localhost:3005');
}
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  }
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadDir));

global.db = db;

app.post('/api/auth/login', login);
// Public reads and the public chatbot remain available. All other API writes
// require a valid admin bearer token.
app.use('/api', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.method === 'POST' && req.path === '/assistant/chat') return next();
  return requireAdmin(req, res, next);
});

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
const server = app.listen(PORT, '0.0.0.0', () => console.log(`Servidor escuchando en el puerto ${PORT}`));
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso. Cierra la instancia anterior de la API antes de iniciar otra.`);
  } else {
    console.error('No fue posible iniciar el servidor:', err.message);
  }
  process.exit(1);
});

module.exports = app;
