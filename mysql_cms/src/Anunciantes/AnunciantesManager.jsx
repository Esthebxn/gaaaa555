import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import anunciantesSeed from './anunciantesData';
import { API_URL, anunciantesApi } from '../services/api';
import ImageUploader from '../ImageUploader/ImageUploader';
import SidePanel from '../SidePanel/SidePanel';
import './AnunciantesManager.css';

const placeholderImage = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#202020"/><rect x="12" y="16" width="40" height="29" rx="4" fill="none" stroke="#888" stroke-width="3"/><path d="M22 53h20M32 45v8" stroke="#888" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="30" r="7" fill="#dc2626"/></svg>')}`;

const getImageUrls = (anunciante) => {
  const apiOrigin = new URL(API_URL, window.location.origin).origin;
  const urls = [anunciante.imagen_url, anunciante.imagen, anunciante.logo_url, anunciante.flyer_url, anunciante.flyer]
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => {
      const url = item.trim();
      if (/^(https?:|data:|blob:|\/\/)/i.test(url)) return url;
      const path = url.replace(/^\/+/, '');
      const uploadPath = path.includes('/') ? path : `uploads/${path}`;
      return `${apiOrigin}/${uploadPath}`;
    });
  return [...new Set([...urls, placeholderImage])];
};

const AnunciantesManager = () => {
  const [anunciantes, setAnunciantes] = useState(anunciantesSeed);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageUploadsInProgress, setImageUploadsInProgress] = useState({});
  const [editingAnunciante, setEditingAnunciante] = useState(null);
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    descripcion: '',
    logo_url: '',
    sitio_web: '',
    activo: true,
    nombre: '',
    categoria: '',
    horario: '',
    imagen: '',
    flyer: ''
  });

  useEffect(() => {
    cargarAnunciantes();
  }, []);

  const cargarAnunciantes = async () => {
    try {
      const data = await anunciantesApi.list();
      if (Array.isArray(data)) setAnunciantes(data);
    } catch (err) {
      console.warn("API de anunciantes no disponible, usando datos locales:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(imageUploadsInProgress).some(Boolean)) {
      alert('Espera a que termine la subida de las imágenes antes de guardar.');
      return;
    }

    // Validación básica
    if (!formData.nombre_empresa.trim()) {
      alert('El nombre de la empresa es requerido');
      return;
    }

    const dataToSave = {
      nombre_empresa: formData.nombre_empresa.trim(),
      contacto: formData.contacto.trim(),
      telefono: formData.telefono.trim(),
      email: formData.email.trim(),
      direccion: formData.direccion.trim(),
      descripcion: formData.descripcion.trim(),
      logo_url: formData.logo_url.trim(),
      sitio_web: formData.sitio_web.trim(),
      activo: formData.activo,
      nombre: formData.nombre.trim() || formData.nombre_empresa.trim(),
      categoria: formData.categoria.trim(),
      horario: formData.horario.trim(),
      imagen: formData.imagen.trim(),
      flyer: formData.flyer.trim()
    };

    setSaving(true);
    try {
      if (editingAnunciante) {
        await anunciantesApi.update(editingAnunciante.id, dataToSave);
        setAnunciantes(prev => prev.map(a => a.id === editingAnunciante.id ? { ...a, ...dataToSave } : a));
        alert('Anunciante actualizado exitosamente');
      } else {
        const resp = await anunciantesApi.create(dataToSave);
        const newId = resp?.id;
        if (!newId) throw new Error('El servidor no devolvió el ID del anunciante guardado.');
        setAnunciantes(prev => [...prev, { id: newId, ...dataToSave }]);
        alert('Anunciante creado exitosamente');
      }
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err.message || 'No se pudo guardar el anunciante. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (anunciante) => {
    setEditingAnunciante(anunciante);
    setFormData({
      nombre_empresa: anunciante.nombre_empresa || '',
      contacto: anunciante.contacto || '',
      telefono: anunciante.telefono || '',
      email: anunciante.email || '',
      direccion: anunciante.direccion || '',
      descripcion: anunciante.descripcion || '',
      logo_url: anunciante.logo_url || anunciante.logo || '',
      sitio_web: anunciante.sitio_web || '',
      activo: anunciante.activo === true || Number(anunciante.activo) === 1,
      nombre: anunciante.nombre || '',
      categoria: anunciante.categoria || '',
      horario: anunciante.horario || '',
      imagen: anunciante.imagen || anunciante.imagen_url || '',
      flyer: anunciante.flyer || anunciante.flyer_url || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este anunciante?')) {
      try {
        await anunciantesApi.remove(id);
        setAnunciantes(prev => prev.filter(a => a.id !== id));
        alert('Anunciante eliminado exitosamente');
      } catch (err) {
        console.error(err);
        alert(err.message || 'No se pudo eliminar el anunciante. Intenta nuevamente.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_empresa: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
      descripcion: '',
      logo_url: '',
      sitio_web: '',
      activo: true,
      nombre: '',
      categoria: '',
      horario: '',
      imagen: '',
      flyer: ''
    });
    setEditingAnunciante(null);
    setShowForm(false);
  };

  const filteredAnunciantes = anunciantes.filter(anunciante => {
    const nombre = anunciante.nombre || '';
    const categoria = anunciante.categoria || '';
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = nombre.toLowerCase().includes(searchLower) ||
      categoria.toLowerCase().includes(searchLower) ||
      (anunciante.nombre_empresa || '').toLowerCase().includes(searchLower);
    return matchesSearch && (!categoryFilter || categoria === categoryFilter);
  });
  const categories = [...new Set(anunciantes.map((item) => item.categoria).filter(Boolean))].sort();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="manager-container anunciantes-manager"
    >
      {/* Header */}
      <div className="manager-header">
        <div className="header-left">
          <h2>Gestión de Anunciantes</h2>
          <p>Administra los anunciantes de ZoomTV</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="primary-btn"
        >
          <Plus className="icon" />
          Nuevo Anunciante
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Buscar anunciantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="filter-btn" aria-expanded={showFilters} onClick={() => setShowFilters((value) => !value)}>
          <Filter className="icon" />
          Filtros
        </button>
      </div>

      {showFilters && (
        <div className="anunciantes-filter-panel">
          <label htmlFor="anunciantes-categoria">Categoría</label>
          <select id="anunciantes-categoria" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="">Todas las categorías</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
      )}

      <SidePanel
        isOpen={showForm}
        onClose={resetForm}
        title={editingAnunciante ? 'Editar Anunciante' : 'Nuevo Anunciante'}
        wide
      >
            <form onSubmit={handleSubmit} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre de la Empresa *</label>
                  <input
                    type="text"
                    value={formData.nombre_empresa}
                    onChange={(e) => setFormData({...formData, nombre_empresa: e.target.value})}
                    required
                    maxLength={255}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Nombre para Mostrar</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="form-input"
                    maxLength={255}
                    placeholder="Igual que nombre de empresa si no se especifica"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contacto</label>
                  <input
                    type="text"
                    value={formData.contacto}
                    onChange={(e) => setFormData({...formData, contacto: e.target.value})}
                    className="form-input"
                    maxLength={100}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    className="form-input"
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="form-input"
                    maxLength={100}
                  />
                </div>
                <div className="form-group">
                  <label>Sitio Web</label>
                  <input
                    type="text"
                    inputMode="url"
                    value={formData.sitio_web}
                    onChange={(e) => setFormData({...formData, sitio_web: e.target.value})}
                    className="form-input"
                    maxLength={255}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <textarea
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  rows={2}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  rows={3}
                  className="form-textarea"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoría</label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="form-input"
                    maxLength={100}
                    placeholder="Gastronomía, Automotriz, etc."
                  />
                </div>
                <div className="form-group">
                  <label>Horario</label>
                  <input
                    type="text"
                    value={formData.horario}
                    onChange={(e) => setFormData({...formData, horario: e.target.value})}
                    className="form-input"
                    maxLength={100}
                    placeholder="Lun-Dom: 8:00 AM - 6:00 PM"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Logo</label>
                <ImageUploader
                  value={formData.logo_url}
                  onChange={(value) => setFormData({...formData, logo_url: value})}
                  onUploadingChange={(uploading) => setImageUploadsInProgress((prev) => ({ ...prev, logo_url: uploading }))}
                  placeholder="Selecciona un logo o ingresa una URL"
                />
              </div>

              <div className="form-group">
                <label>Imagen Principal</label>
                <ImageUploader
                  value={formData.imagen}
                  onChange={(value) => setFormData({...formData, imagen: value})}
                  onUploadingChange={(uploading) => setImageUploadsInProgress((prev) => ({ ...prev, imagen: uploading }))}
                  placeholder="Selecciona una imagen principal o ingresa una URL"
                />
              </div>

              <div className="form-group">
                <label>Flyer</label>
                <ImageUploader
                  value={formData.flyer}
                  onChange={(value) => setFormData({...formData, flyer: value})}
                  onUploadingChange={(uploading) => setImageUploadsInProgress((prev) => ({ ...prev, flyer: uploading }))}
                  placeholder="Selecciona un flyer o ingresa una URL"
                />
              </div>

              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  />
                  <span>Anunciante activo</span>
                </label>
              </div>
              <div className="form-actions">
                <button type="button" onClick={resetForm} className="secondary-btn">
                  Cancelar
                </button>
                <button type="submit" className="primary-btn" disabled={saving || Object.values(imageUploadsInProgress).some(Boolean)}>
                  {Object.values(imageUploadsInProgress).some(Boolean) ? 'Subiendo imagen…' : saving ? 'Guardando…' : editingAnunciante ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
      </SidePanel>

      {/* Anunciantes Grid */}
      <div className="items-grid">
        {filteredAnunciantes.map((anunciante) => (
          <motion.div
            key={anunciante.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="item-card anunciante-item-card"
          >
            <div className="card-image">
              <img
                key={anunciante.id}
                src={getImageUrls(anunciante)[0]}
                alt={`Logo de ${anunciante.nombre || anunciante.nombre_empresa}`}
                onError={(event) => {
                  const nextIndex = Number(event.currentTarget.dataset.candidateIndex || 0) + 1;
                  const imageCandidates = getImageUrls(anunciante);
                  if (nextIndex < imageCandidates.length) {
                    event.currentTarget.dataset.candidateIndex = String(nextIndex);
                    event.currentTarget.src = imageCandidates[nextIndex];
                  } else {
                    event.currentTarget.hidden = true;
                  }
                }}
              />
            </div>
            <div className="card-content">
              <h3>{anunciante.nombre || anunciante.nombre_empresa}</h3>
              <p className="category">{anunciante.categoria}</p>
              {anunciante.horario && (
                <p className="horario">{anunciante.horario}</p>
              )}
            </div>
            <div className="card-actions">
              <button
                onClick={() => handleEdit(anunciante)}
                className="action-btn edit"
                aria-label={`Editar ${anunciante.nombre || anunciante.nombre_empresa}`}
                title="Editar anunciante"
              >
                <Edit className="icon" />
              </button>
              <button
                onClick={() => handleDelete(anunciante.id)}
                className="action-btn delete"
                aria-label={`Eliminar ${anunciante.nombre || anunciante.nombre_empresa}`}
                title="Eliminar anunciante"
              >
                <Trash2 className="icon" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredAnunciantes.length === 0 && (
        <div className="empty-state">
          <p>No se encontraron anunciantes</p>
        </div>
      )}
    </motion.div>
  );
};

export default AnunciantesManager;
