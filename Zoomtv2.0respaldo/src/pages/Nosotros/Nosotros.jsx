import React, { useState, useEffect } from "react";
import "./Nosotros.css";

// Imágenes locales (fallback)
import logoZoom from "../../assets/images/logoZoomtv.png";
import historiaImg from "../../assets/images/chatbot_logo.png";
import misionImg from "../../assets/images/profesional3.jpg";
import visionImg from "../../assets/images/profesional5.jpg";
import equipoCompletoImg from "../../assets/images/equipo.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Convierte rutas de uploads en URL completas del backend
const resolveImg = (value) => {
  if (!value) return "";
  if (/^(https?:|data:|blob:|\/\/)/i.test(value)) return value;
  const apiOrigin = new URL(API_URL, window.location.origin).origin;
  const path = String(value).replace(/^\/+/, "");
  return `${apiOrigin}/${path.includes("/") ? path : `uploads/${path}`}`;
};

// Datos estáticos de respaldo
const nosotrosFallback = {
  nombre_empresa: "Zoom TV Canal 12",
  slogan: "Tu canal de confianza",
  descripcion: "Somos un equipo comprometido con la excelencia en la comunicación",
  historia: "Canal de televisión regional comprometido con la comunidad.",
  mision: "Informar, entretener y conectar a nuestra comunidad con contenido de calidad.",
  vision: "Ser el canal de referencia regional, innovando en contenidos y tecnología.",
  equipo: "Contamos con un equipo de profesionales apasionados por la comunicación.",
  email: "contacto@zoomtv.com",
  telefono: "+504 0000-0000",
  banner_imagen: "",
  equipo_imagen: "",
  historia_imagen: "",
  mision_imagen: "",
  vision_imagen: "",
};

// Mezcla los datos de la API con el respaldo, ignorando valores vacíos
const combinar = (data) => {
  const registro = Array.isArray(data) ? data[0] : data;
  const resultado = { ...nosotrosFallback };
  Object.entries(registro || {}).forEach(([k, v]) => {
    if (v !== null && v !== undefined && String(v).trim() !== "") resultado[k] = v;
  });
  return resultado;
};

const Nosotros = () => {
  const [nosotrosData, setNosotrosData] = useState(nosotrosFallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/nosotros`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setNosotrosData(combinar(data));
        setLoading(false);
      })
      .catch((err) => {
        console.warn("No se pudo cargar nosotros desde la API, usando datos locales:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="nosotros-container" style={{ textAlign: "center", padding: "80px" }}>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="nosotros-container">
      <div className="nosotros-banner">
        <img
          src={resolveImg(nosotrosData.banner_imagen) || logoZoom}
          alt={`Logo ${nosotrosData.nombre_empresa}`}
          className="logo-canal"
        />
        <h1>{nosotrosData.nombre_empresa}</h1>
        <p>{nosotrosData.slogan}</p>
      </div>

      <div className="nosotros-header">
        <h2>Conoce nuestro equipo y valores</h2>
        <p>{nosotrosData.descripcion}</p>
      </div>

      <div className="equipo-section">
        <h2>Nuestro Equipo</h2>
        <div className="equipo-completo">
          <img
            src={resolveImg(nosotrosData.equipo_imagen) || equipoCompletoImg}
            alt={`Equipo completo de ${nosotrosData.nombre_empresa}`}
          />
          <p>{nosotrosData.equipo || ""}</p>
        </div>
      </div>

      <div className="nosotros-sections">
        <div className="nosotros-section historia">
          <div className="section-image">
            <img src={resolveImg(nosotrosData.historia_imagen) || historiaImg} alt="Historia del canal" />
          </div>
          <div className="section-content">
            <h2>Nuestra Historia</h2>
            {(nosotrosData.historia || "").split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="nosotros-section mision reverse">
          <div className="section-image">
            <img src={resolveImg(nosotrosData.mision_imagen) || misionImg} alt={`Misión de ${nosotrosData.nombre_empresa}`} />
          </div>
          <div className="section-content">
            <h2>Nuestra Misión</h2>
            <p>{nosotrosData.mision}</p>
          </div>
        </div>

        <div className="nosotros-section vision">
          <div className="section-image">
            <img src={resolveImg(nosotrosData.vision_imagen) || visionImg} alt={`Visión de ${nosotrosData.nombre_empresa}`} />
          </div>
          <div className="section-content">
            <h2>Nuestra Visión</h2>
            <p>{nosotrosData.vision}</p>
          </div>
        </div>
      </div>

      <div className="contacto-section">
        <p>Envíanos tu información a: <a href={`mailto:${nosotrosData.email}`}>{nosotrosData.email}</a></p>
        <p>O llámanos al: <a href={`tel:${nosotrosData.telefono}`}>{nosotrosData.telefono}</a></p>
      </div>
    </div>
  );
};

export default Nosotros;