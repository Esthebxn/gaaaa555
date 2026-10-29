const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function obtenerNoticias(categoria) {
  const params = new URLSearchParams({ activa: 'true' });
  if (categoria) params.set('categoria', categoria);
  const response = await fetch(`${API_URL}/noticias?${params}`);
  if (!response.ok) throw new Error('No fue posible cargar las noticias');
  return response.json();
}

export async function obtenerNoticia(id) {
  const response = await fetch(`${API_URL}/noticias/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('No fue posible cargar la noticia');
  return response.json();
}
