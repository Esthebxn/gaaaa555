import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Header from "./Header/Header";
import Chatbot from "./Chatbot/Chatbot";
import Loading from "../components/Loading/Loading";

// Páginas principales
import Inicio from "../pages/Inicio/Inicio";
import Nosotros from "../pages/Nosotros/Nosotros";
import Actualidad from "../pages/Actualidad/Actualidad";
import Deportes from "../pages/Actualidad/Deportes";
import Nacionales from "../pages/Actualidad/Nacionales";
import Regionales from "../pages/Actualidad/Regionales";
import Musica from "../pages/Actualidad/Musica";
import Noticia from "../pages/Noticia/Noticia";
import RedesSociales from "../pages/RedesSociales/RedesSociales";
import Programacion12 from "../pages/Programacion/Programacion12";
import Anunciantes from "../pages/Anunciantes/Anunciantes";
import Live9 from "../pages/Live9/Live9";
import ZoomApp from "../pages/ZoomApp/ZoomApp";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Simula carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // ⏳ 3 segundos de loading
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />; // 🔥 Se muestra primero el Loading
  }

  return (
    <Router>
      <div className="app">
        <Header /> {/* ✅ HamburguesaMenu ya está dentro del Header */}
        <Routes>
          <Route index element={<Inicio />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/actualidad" element={<Actualidad />} />
          <Route path="/actualidad/deportes/*" element={<Deportes />} />
          <Route path="/actualidad/nacionales" element={<Nacionales />} />
          <Route path="/actualidad/regionales" element={<Regionales />} />
          <Route path="/actualidad/musica" element={<Musica />} />
          <Route path="/noticia/:categoria/:id" element={<Noticia />} />
          <Route path="/programacion" element={<Programacion12 />} />
          <Route path="/envivo" element={<Live9 />} />
          <Route path="/anunciantes" element={<Anunciantes />} />
          <Route path="/anunciantes/:id" element={<Anunciantes />} />
          <Route path="/redes-sociales" element={<RedesSociales />} />
          <Route path="/zoom-app" element={<ZoomApp />} />
          <Route path="/live" element={<Live9 />} />
          <Route path="/zoom-tv-canal-10" element={<Programacion12 />} />
          {/* Ruta directa de Loading (opcional) */}
          <Route path="/loading" element={<Loading />} />
        </Routes>
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
 
