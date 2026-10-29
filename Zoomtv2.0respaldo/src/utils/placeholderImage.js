const crearPlaceholder = (texto) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500" viewBox="0 0 900 500"><rect width="900" height="500" fill="#333333"/><text x="50%" y="50%" fill="#ffffff" font-family="Arial, sans-serif" font-size="38" text-anchor="middle" dominant-baseline="middle">${texto}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const NOTICIA_PLACEHOLDER = crearPlaceholder('Zoom TV');
export const ANUNCIANTE_PLACEHOLDER = crearPlaceholder('Imagen no disponible');
export const FLYER_PLACEHOLDER = crearPlaceholder('Flyer no disponible');
