const SESSION_KEY = 'zoomtv_cms_token';

export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem(SESSION_KEY);
    if (!token) return false;
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return Number(payload.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

export const getAuthToken = () => {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
};

export const setAuthenticated = (token) => {
  localStorage.setItem(SESSION_KEY, token);
};

export const clearAuthenticated = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignorar
  }
};
