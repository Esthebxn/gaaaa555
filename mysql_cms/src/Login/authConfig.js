// Acceso al panel de administración.
// El CMS no tiene backend (ver src/data/*), así que este login es solo una
// puerta de acceso local: no es un mecanismo de seguridad real, cualquiera
// con acceso al código puede verlo. No hay contraseña fija: basta con
// ingresar un nombre de usuario.
const SESSION_KEY = 'zoomtv_cms_session';

export const checkCredentials = (username) => {
  return username.trim().length > 0;
};

export const isAuthenticated = () => {
  try {
    return localStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setAuthenticated = () => {
  try {
    localStorage.setItem(SESSION_KEY, 'true');
  } catch {
    // localStorage no disponible (modo privado, etc.) - la sesión no persiste
  }
};

export const clearAuthenticated = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignorar
  }
};
