import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerNoticias } from '../../services/noticiasApi';
import { categoriaASlug } from '../../utils/categoriaSlug';
import { NOTICIA_PLACEHOLDER } from '../../utils/placeholderImage';
import './NoticiasSection.css';

const fechaVisible = (noticia) => noticia.fecha || (noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : '');

export default function NoticiasSection({ categoria, titulo }) {
  const containerRef = useRef(null);
  const [noticias, setNoticias] = useState([]);
  const [error, setError] = useState(false);
  const slug = categoriaASlug(categoria);

  useEffect(() => {
    let vigente = true;
    setError(false);
    obtenerNoticias(categoria)
      .then((items) => { if (vigente) setNoticias(items); })
      .catch(() => { if (vigente) setError(true); });
    return () => { vigente = false; };
  }, [categoria]);

  useEffect(() => {
    const elements = containerRef.current?.querySelectorAll('.noticias-reveal');
    if (!elements?.length) return undefined;

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [noticias, error]);

  const [principal, ...resto] = noticias;
  return (
    <div className="noticias-container" ref={containerRef}>
      <header className="noticias-header noticias-reveal"><h1>{titulo}</h1></header>
      {error ? <p className="noticias-vacio">No fue posible cargar las noticias.</p> : noticias.length === 0 ? (
        <p className="noticias-vacio">No hay noticias disponibles</p>
      ) : (
        <div className="noticias-periodico">
          <Link to={`/noticia/${categoriaASlug(principal.categoria || categoria)}/${principal.id}`} className="noticia-principal noticias-reveal">
            <img src={principal.imagen_url || principal.imagen || NOTICIA_PLACEHOLDER} alt={principal.titulo} className="noticia-principal-img" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = NOTICIA_PLACEHOLDER; }} />
            <div className="noticia-principal-texto">
              <span className="noticia-kicker">{principal.categoria || categoria}</span><h2>{principal.titulo}</h2>
              <p className="noticia-desc">{principal.descripcion || principal.resumen}</p>
              <p className="noticia-byline">{fechaVisible(principal)} {principal.fuente && `· ${principal.fuente}`}</p>
            </div>
          </Link>
          {resto.length > 0 && <ul className="noticias-lista">{resto.map((noticia) => (
            <li key={noticia.id} className="noticias-reveal"><Link to={`/noticia/${categoriaASlug(noticia.categoria || categoria)}/${noticia.id}`} className="noticia-item">
              <img src={noticia.imagen_url || noticia.imagen || NOTICIA_PLACEHOLDER} alt={noticia.titulo} className="noticia-item-img" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = NOTICIA_PLACEHOLDER; }} />
              <div className="noticia-item-texto"><h3>{noticia.titulo}</h3><p className="noticia-desc">{noticia.descripcion || noticia.resumen}</p><p className="noticia-byline">{fechaVisible(noticia)} {noticia.fuente && `· ${noticia.fuente}`}</p></div>
            </Link></li>
          ))}</ul>}
        </div>
      )}
    </div>
  );
}
