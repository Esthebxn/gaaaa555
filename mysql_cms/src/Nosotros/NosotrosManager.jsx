import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Edit, Building2 } from 'lucide-react';
import nosotrosSeed from './nosotrosData';
import { nosotrosApi, API_URL } from '../services/api';
import ImageUploader from '../ImageUploader/ImageUploader';
import SidePanel from '../SidePanel/SidePanel';
import logoZoom from '../assets/nosotros/logoZoomtv.png';
import historiaImg from '../assets/nosotros/chatbot_logo.png';
import misionImg from '../assets/nosotros/profesional3.jpg';
import visionImg from '../assets/nosotros/profesional5.jpg';
import equipoImg from '../assets/nosotros/equipo.png';
import './NosotrosManager.css';

const initialForm = {
  titulo: '',
  descripcion: '',
  mision: '',
  vision: '',
  imagen_url: '',
  nombre_empresa: '',
  slogan: '',
  email: '',
  telefono: '',
  historia: '',
  equipo: '',
  banner_imagen: '',
  equipo_imagen: '',
  historia_imagen: '',
  mision_imagen: '',
  vision_imagen: ''
};

const resolveImg = (value) => {
  if (!value || /^(https?:|data:|blob:|\/\/)/i.test(value)) return value;
  const apiOrigin = new URL(API_URL, window.location.origin).origin;
  const path = String(value).replace(/^\/+/, '');
  return `${apiOrigin}/${path.includes('/') ? path : `uploads/${path}`}`;
};
const texto = (v) => (v === null || v === undefined ? '' : String(v));

const normalizar = (obj) => {
  const limpio = { ...initialForm };
  Object.entries(obj || {}).forEach(([k, v]) => {
    limpio[k] = v === null || v === undefined ? '' : v;
  });
  return limpio;
};

const NosotrosManager = () => {
  const [nosotrosData, setNosotrosData] = useState(nosotrosSeed);
  const [showForm, setShowForm] = useState(false);
  const [editingNosotros, setEditingNosotros] = useState(null);
  const [editingSection, setEditingSection] = useState('');
  const formRef = useRef(null);
  const [formData, setFormData] = useState({ ...initialForm });

  useEffect(() => {
    cargarNosotros();
  }, []);

  const cargarNosotros = async () => {
    try {
      const data = await nosotrosApi.get();
      const registro = Array.isArray(data) ? data[0] : data;
      if (registro && registro.titulo) {
        setNosotrosData(normalizar(registro));
      }
    } catch (err) {
      console.warn('API de Nosotros no disponible; se conservan los datos locales:', err);
    }
  };

  const actualizarCampo = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleEdit = (nosotros, section = 'toda la información') => {
    setEditingNosotros(nosotros);
    setEditingSection(section);
    setFormData(normalizar(nosotros));
    setShowForm(true);

    const campoInicial = {
      encabezado: 'banner_imagen',
      equipo: 'equipo_imagen',
      historia: 'historia',
      misión: 'mision',
      visión: 'vision',
      contacto: 'email',
      descripción: 'descripcion'
    }[section];

    if (campoInicial) {
      window.setTimeout(() => {
        formRef.current?.querySelector(`[name="${campoInicial}"]`)?.focus();
      }, 350);
    }
  };

  const handleCreate = () => {
    setEditingNosotros(null);
    setEditingSection('toda la información');
    setFormData(normalizar(nosotrosSeed));
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ ...initialForm });
    setEditingNosotros(null);
    setEditingSection('');
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!texto(formData.titulo).trim()) {
      alert('El título es requerido.');
      return;
    }
    if (!texto(formData.nombre_empresa).trim()) {
      alert('El nombre de la empresa es requerido.');
      return;
    }

    const dataToSave = {};
    Object.keys(initialForm).forEach((k) => {
      dataToSave[k] = texto(formData[k]).trim();
    });

    try {
      if (editingNosotros?.id) {
        await nosotrosApi.update(editingNosotros.id, dataToSave);
        setNosotrosData(prev => ({ ...prev, ...dataToSave }));
        alert('Información actualizada correctamente.');
      } else {
        const response = await nosotrosApi.create(dataToSave);
        setNosotrosData({ ...dataToSave, id: response?.id || Date.now() });
        alert('Información creada correctamente.');
      }

      await cargarNosotros();
      resetForm();
    } catch (err) {
      console.error('Error guardando Nosotros:', err);
      alert(`No se pudo guardar la información: ${err.message || 'Error del servidor'}`);
    }
  };

  const campoImagen = (campo, etiqueta = 'Imagen') => (
    <div className="form-group">
      <label>{etiqueta}</label>
      <ImageUploader
        value={formData[campo] || ''}
        onChange={(value) => actualizarCampo(campo, value)}
        placeholder="Selecciona una imagen o ingresa una URL"
      />
    </div>
  );

  const campoArea = (campo, etiqueta, filas = 4) => (
    <div className="form-group">
      <label>{etiqueta}</label>
      <textarea
        name={campo}
        value={formData[campo] || ''}
        onChange={(e) => actualizarCampo(campo, e.target.value)}
        rows={filas}
        className="form-textarea"
      />
    </div>
  );

  const campoTexto = (campo, etiqueta, tipo = 'text', placeholder = '') => (
    <div className="form-group">
      <label>{etiqueta}</label>
      <input
        name={campo}
        type={tipo}
        value={formData[campo] || ''}
        onChange={(e) => actualizarCampo(campo, e.target.value)}
        className="form-input"
        placeholder={placeholder}
      />
    </div>
  );

  const esGeneral = !editingNosotros || editingSection === 'toda la información';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="manager-container"
    >
      <div className="manager-header">
        <div className="header-left">
          <h2>Gestión de Información de la Empresa</h2>
          <p>Administra la información de ZoomTV</p>
        </div>
      </div>

      <SidePanel
        isOpen={showForm}
        onClose={resetForm}
        title={editingNosotros ? `Editar ${editingSection}` : 'Nueva Información'}
        wide
      >
        <form ref={formRef} onSubmit={handleSubmit} className="form">
          {esGeneral && (
            <>
              <div className="form-row">
                {campoTexto('titulo', 'Título *', 'text', 'ZoomTV')}
                {campoTexto('nombre_empresa', 'Nombre de la empresa *', 'text', 'Zoom TV Canal 10')}
              </div>
              {campoTexto('slogan', 'Slogan', 'text', 'Información veraz, entretenimiento de calidad')}
            </>
          )}

          {editingSection === 'encabezado' && (
            <>
              <h3>Imagen del encabezado</h3>
              <p>Solo puedes cambiar la imagen. El nombre y el slogan no se modifican aquí.</p>
              {campoImagen('banner_imagen')}
            </>
          )}

          {editingSection === 'equipo' && (
            <>
              <h3>Imagen del equipo</h3>
              <p>Solo puedes cambiar la imagen del equipo. El título y la descripción se mantienen.</p>
              {campoImagen('equipo_imagen')}
            </>
          )}

          {editingSection === 'historia' && (
            <>
              <h3>Nuestra Historia</h3>
              {campoImagen('historia_imagen')}
              {campoArea('historia', 'Descripción de la historia')}
            </>
          )}

          {editingSection === 'misión' && (
            <>
              <h3>Nuestra Misión</h3>
              {campoImagen('mision_imagen')}
              {campoArea('mision', 'Descripción de la misión')}
            </>
          )}

          {editingSection === 'visión' && (
            <>
              <h3>Nuestra Visión</h3>
              {campoImagen('vision_imagen')}
              {campoArea('vision', 'Descripción de la visión')}
            </>
          )}

          {editingSection === 'contacto' && (
            <>
              <h3>Información de contacto</h3>
              {campoTexto('email', 'Correo electrónico', 'email', 'contacto@zoomtvcanal10.com')}
              {campoTexto('telefono', 'Teléfono', 'tel', '+51 999 888 777')}
            </>
          )}

          {editingSection === 'descripción' && (
            <>
              <h3>Descripción de la empresa</h3>
              {campoArea('descripcion', 'Descripción')}
            </>
          )}

          {esGeneral && (
            <>
              <hr />
              <h3>Encabezado</h3>
              {campoImagen('banner_imagen', 'Imagen del encabezado')}

              <h3>Equipo</h3>
              {campoImagen('equipo_imagen', 'Imagen del equipo')}
              {campoArea('equipo', 'Descripción del equipo')}

              <h3>Nuestra Historia</h3>
              {campoImagen('historia_imagen', 'Imagen de la historia')}
              {campoArea('historia', 'Descripción de la historia')}

              <h3>Nuestra Misión</h3>
              {campoImagen('mision_imagen', 'Imagen de la misión')}
              {campoArea('mision', 'Descripción de la misión')}

              <h3>Nuestra Visión</h3>
              {campoImagen('vision_imagen', 'Imagen de la visión')}
              {campoArea('vision', 'Descripción de la visión')}

              <hr />
              <h3>Contacto</h3>
              {campoTexto('email', 'Correo electrónico', 'email', 'contacto@zoomtvcanal10.com')}
              {campoTexto('telefono', 'Teléfono', 'tel', '+51 999 888 777')}
              {campoArea('descripcion', 'Descripción introductoria', 3)}
            </>
          )}

          <div className="form-actions">
            <button type="button" onClick={resetForm} className="secondary-btn">
              Cancelar
            </button>
            <button type="submit" className="primary-btn">
              {editingNosotros ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </SidePanel>

      {nosotrosData ? (
        <div className="nosotros-dashboard-preview">
          <div className="nd-page">
            <section className="nd-banner">
              <img src={resolveImg(nosotrosData.banner_imagen) || logoZoom} alt="Logo Zoom TV" />
              <h1>{nosotrosData.nombre_empresa}</h1>
              <p>{nosotrosData.slogan}</p>
              <button
                type="button"
                className="nd-edit nd-edit-banner"
                onClick={() => handleEdit(nosotrosData, 'encabezado')}
              >
                <Edit size={15} /> Editar imagen
              </button>
            </section>

            <header className="nd-intro">
              <h2>Conoce nuestro equipo y valores</h2>
              <p>{nosotrosData.descripcion || 'Somos un equipo comprometido con la excelencia en la comunicación.'}</p>
              <button
                type="button"
                className="nd-edit"
                onClick={() => handleEdit(nosotrosData, 'descripción')}
              >
                <Edit size={15} /> Editar descripción
              </button>
            </header>

            <section className="nd-team">
              <button
                type="button"
                className="nd-edit"
                onClick={() => handleEdit(nosotrosData, 'equipo')}
              >
                <Edit size={15} /> Editar imagen
              </button>
              <h2>Nuestro Equipo</h2>
              <div className="nd-team-content">
                <img src={resolveImg(nosotrosData.equipo_imagen) || equipoImg} alt="Equipo de Zoom TV" />
                <p>{nosotrosData.equipo}</p>
              </div>
            </section>

            <div className="nd-stories">
              <article className="nd-story">
                <img src={resolveImg(nosotrosData.historia_imagen) || historiaImg} alt="Historia del canal" />
                <div>
                  <button type="button" className="nd-edit" onClick={() => handleEdit(nosotrosData, 'historia')}>
                    <Edit size={15} /> Editar historia
                  </button>
                  <h2>Nuestra Historia</h2>
                  <p>{nosotrosData.historia}</p>
                </div>
              </article>

              <article className="nd-story nd-reverse">
                <img src={resolveImg(nosotrosData.mision_imagen) || misionImg} alt="Misión de Zoom TV" />
                <div>
                  <button type="button" className="nd-edit" onClick={() => handleEdit(nosotrosData, 'misión')}>
                    <Edit size={15} /> Editar misión
                  </button>
                  <h2>Nuestra Misión</h2>
                  <p>{nosotrosData.mision}</p>
                </div>
              </article>

              <article className="nd-story">
                <img src={resolveImg(nosotrosData.vision_imagen) || visionImg} alt="Visión de Zoom TV" />
                <div>
                  <button type="button" className="nd-edit" onClick={() => handleEdit(nosotrosData, 'visión')}>
                    <Edit size={15} /> Editar visión
                  </button>
                  <h2>Nuestra Visión</h2>
                  <p>{nosotrosData.vision}</p>
                </div>
              </article>
            </div>

            <section className="nd-contact">
              <button type="button" className="nd-edit" onClick={() => handleEdit(nosotrosData, 'contacto')}>
                <Edit size={15} /> Editar contacto
              </button>
              <p>
                Envíanos tu información a:{' '}
                <a href={`mailto:${nosotrosData.email}`}>{nosotrosData.email}</a>
              </p>
              <p>
                O llámanos al:{' '}
                <a href={`tel:${nosotrosData.telefono}`}>{nosotrosData.telefono}</a>
              </p>
            </section>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon"><Building2 className="icon" /></div>
          <h3>No hay información de la empresa</h3>
          <p>Comienza creando la información de ZoomTV.</p>
          <button onClick={handleCreate} className="primary-btn">
            Crear Información
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default NosotrosManager;