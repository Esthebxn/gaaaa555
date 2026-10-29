export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || payload.message || 'No fue posible comunicarse con el servidor');
  }
  return response.status === 204 ? null : response.json();
}

export const noticiasApi = {
  list: () => request('/noticias'),
  create: (data) => request('/noticias', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  update: (id, data) => request(`/noticias/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  remove: (id) => request(`/noticias/${id}`, { method: 'DELETE' })
};

export const programacionApi = {
  list: () => request('/programacion'),
  create: (data) => request('/programacion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  update: (id, data) => request(`/programacion/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  remove: (id) => request(`/programacion/${id}`, { method: 'DELETE' })
};

export const anunciantesApi = {
  list: () => request('/anunciantes'),
  create: (data) => request('/anunciantes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  update: (id, data) => request(`/anunciantes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  remove: (id) => request(`/anunciantes/${id}`, { method: 'DELETE' })
};

export const nosotrosApi = {
  get: () => request('/nosotros'),
  create: (data) => request('/nosotros', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  update: (id, data) => request(`/nosotros/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  remove: (id) => request(`/nosotros/${id}`, { method: 'DELETE' })
};

export const liveStreamApi = {
  get: () => request('/live-stream'),
  list: () => request('/live-stream/all'),
  create: (data) => request('/live-stream', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  update: (id, data) => request(`/live-stream/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  remove: (id) => request(`/live-stream/${id}`, { method: 'DELETE' }),
  activate: (id) => request(`/live-stream/${id}/activate`, { method: 'PATCH' }),
  deactivate: (id) => request(`/live-stream/${id}/deactivate`, { method: 'PATCH' })
};

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${API_URL}/upload/image`, { method: 'POST', body: formData });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'No fue posible subir la imagen');
  return payload.data;
}
