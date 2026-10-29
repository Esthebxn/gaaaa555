import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Anunciantes.css";
import { ANUNCIANTE_PLACEHOLDER, FLYER_PLACEHOLDER } from "../../utils/placeholderImage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function Anunciantes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anunciantes, setAnunciantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let vigente = true;
    fetch(`${API_URL}/anunciantes`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!vigente) return;
        setAnunciantes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("No se pudo cargar anunciantes desde la API:", err);
        if (vigente) {
          setAnunciantes([]);
          setLoading(false);
        }
      });
    return () => { vigente = false; };
  }, []);

  const volverAlListado = () => navigate("/anunciantes");

  if (loading) {
    return <main className="anunciantes-container"><p className="anunciantes-estado">Cargando anunciantes...</p></main>;
  }

  if (id) {
    const anunciante = anunciantes.find((item) => String(item.id) === id);
    if (!anunciante) {
      return (
        <main className="anunciantes-detalle-container">
          <button className="anunciantes-volver" onClick={volverAlListado}>← Volver a anunciantes</button>
          <p className="anunciantes-estado">No se encontró el anunciante.</p>
        </main>
      );
    }

    const imagen = anunciante.flyer_url || anunciante.logo_url || anunciante.imagen_url || anunciante.imagen;
    return (
      <main className="anunciantes-detalle-container">
        <button className="anunciantes-volver" onClick={volverAlListado}>← Volver a anunciantes</button>
        <article className="anunciantes-detalle">
          <span className="anunciantes-kicker">{anunciante.categoria || "Anunciante"}</span>
          <h1>{anunciante.nombre}</h1>
          <p className="anunciantes-byline">Patrocinador y aliado comercial de Zoom TV</p>
          <img
            src={imagen || FLYER_PLACEHOLDER}
            alt={`Imagen de ${anunciante.nombre}`}
            className="anunciantes-detalle-img"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FLYER_PLACEHOLDER;
            }}
          />
          {anunciante.descripcion && <p className="anunciantes-descripcion">{anunciante.descripcion}</p>}
          <dl className="anunciantes-contacto">
            {anunciante.telefono && <div><dt>Teléfono</dt><dd>{anunciante.telefono}</dd></div>}
            {anunciante.direccion && <div><dt>Dirección</dt><dd>{anunciante.direccion}</dd></div>}
            {anunciante.horario && <div><dt>Horario</dt><dd>{anunciante.horario}</dd></div>}
          </dl>
        </article>
      </main>
    );
  }

  return (
    <main className="anunciantes-container">
      <header className="anunciantes-header">
        <h1>ANUNCIANTES</h1>
      </header>
      {anunciantes.length ? (
        <div className="anunciantes-grid">
          {anunciantes.map((anunciante) => (
            <button
              key={anunciante.id}
              type="button"
              className="anunciante-card"
              onClick={() => navigate(`/anunciantes/${encodeURIComponent(anunciante.id)}`)}
            >
              <img
                src={anunciante.logo_url || anunciante.imagen_url || anunciante.imagen || ANUNCIANTE_PLACEHOLDER}
                alt={anunciante.nombre}
                className="anunciante-img"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = ANUNCIANTE_PLACEHOLDER;
                }}
              />
              <span className="anunciante-info">
                <span className="anunciante-categoria">{anunciante.categoria || "Anunciante"}</span>
                <span className="anunciante-titulo">{anunciante.nombre}</span>
                {anunciante.descripcion && <span className="anunciante-descripcion-corta">{anunciante.descripcion}</span>}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="anunciantes-estado">No hay anunciantes disponibles.</p>
      )}
    </main>
  );
}
