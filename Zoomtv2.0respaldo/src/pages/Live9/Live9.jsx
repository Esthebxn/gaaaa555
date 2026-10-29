import React, { useState, useEffect } from "react";
import "./Live9.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// URL de stream de respaldo
const STREAM_FALLBACK = {
  titulo: "Zoom TV En Vivo",
  url_stream: "https://www.youtube.com/embed/k8l77dz-OgY?autoplay=1&rel=0&modestbranding=1",
};

const Live9 = () => {
  const [streamData, setStreamData] = useState(STREAM_FALLBACK);

  useEffect(() => {
    fetch(`${API_URL}/live-stream`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data.url_stream) {
          setStreamData(data);
        }
      })
      .catch((err) => {
        console.warn("No se pudo cargar live stream desde la API, usando URL de respaldo:", err);
      });
  }, []);

  // Convertir URL normal de YouTube a embed
  const getEmbedUrl = (url) => {
    if (!url) return STREAM_FALLBACK.url_stream;
    if (url.includes("/embed/")) return url;
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(streamData.url_stream);

  return (
    <div className="live9-container-alt">
      <div className="live9-player-alt">
        {/* Branding dentro del reproductor */}
        <div className="live9-brand-inside">📺 {streamData.titulo || "En Vivo"}</div>

        {/* Iframe de YouTube */}
        <iframe
          src={embedUrl}
          className="live9-video-alt"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          title={streamData.titulo || "Live Stream"}
        ></iframe>
      </div>
    </div>
  );
};

export default Live9;