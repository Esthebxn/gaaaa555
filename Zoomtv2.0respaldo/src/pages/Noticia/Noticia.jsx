import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerNoticia } from '../../services/noticiasApi';
import { slugACategoria } from '../../utils/categoriaSlug';
import { NOTICIA_PLACEHOLDER } from '../../utils/placeholderImage';
import './Noticia.css';

export default function Noticia() {
  const { categoria: slug, id } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState(undefined);
  const categoria = slugACategoria(slug);

  useEffect(() => {
    let vigente = true;
    obtenerNoticia(id).then((item) => { if (vigente) setNoticia(item); }).catch(() => { if (vigente) setNoticia(null); });
    return () => { vigente = false; };
  }, [id]);

  if (noticia === undefined) return <div className="noticia-detalle-container"><p className="noticias-vacio">Cargando noticia...</p></div>;
  if (!noticia) return <div className="noticia-detalle-container"><button className="noticia-volver" onClick={() => navigate(-1)}>← Volver</button><p className="noticias-vacio">No se encontró la noticia.</p></div>;

  const fecha = noticia.fecha || (noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : '');
  return <div className="noticia-detalle-container">
    <button className="noticia-volver" onClick={() => navigate(-1)}>← Volver</button>
    <article className="noticia-detalle">
      <span className="noticia-kicker">{noticia.categoria || categoria}</span><h1>{noticia.titulo}</h1>
      <p className="noticia-byline">{fecha} {noticia.fuente && `· ${noticia.fuente}`}</p>
      <img src={noticia.imagen_url || noticia.imagen || NOTICIA_PLACEHOLDER} alt={noticia.titulo} className="noticia-detalle-img" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = NOTICIA_PLACEHOLDER; }} />
      <p className="noticia-detalle-cuerpo">{noticia.contenido || noticia.descripcion || noticia.resumen}</p>
    </article>
  </div>;
}
