const crypto = require('crypto');
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const signature = (value) => crypto.createHmac('sha256', process.env.JWT_SECRET).update(value).digest('base64url');

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function issueToken(username) {
  const now = Math.floor(Date.now() / 1000);
  const input = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: username, iat: now, exp: now + 8 * 60 * 60 })}`;
  return `${input}.${signature(input)}`;
}

function verifyToken(token) {
  if (!process.env.JWT_SECRET) return false;
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return false;
  const input = `${parts[0]}.${parts[1]}`;
  if (!safeEqual(signature(input), parts[2])) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return typeof payload.sub === 'string' && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function login(req, res) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const attempt = loginAttempts.get(ip);
  if (attempt && attempt.resetAt > Date.now() && attempt.count >= MAX_LOGIN_ATTEMPTS) {
    return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.' });
  }
  const { username = '', password = '' } = req.body || {};
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!process.env.JWT_SECRET || !expectedUsername || !expectedPassword) {
    return res.status(503).json({ error: 'El acceso administrativo no está configurado en el servidor.' });
  }
  if (!safeEqual(username, expectedUsername) || !safeEqual(password, expectedPassword)) {
    const current = attempt && attempt.resetAt > Date.now() ? attempt : { count: 0, resetAt: Date.now() + LOGIN_WINDOW_MS };
    loginAttempts.set(ip, { ...current, count: current.count + 1 });
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }
  loginAttempts.delete(ip);
  return res.json({ token: issueToken(expectedUsername), expiresIn: 28800 });
}

function requireAdmin(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match || !verifyToken(match[1])) {
    return res.status(401).json({ error: 'Debes iniciar sesión para realizar esta acción.' });
  }
  return next();
}

module.exports = { login, requireAdmin };
