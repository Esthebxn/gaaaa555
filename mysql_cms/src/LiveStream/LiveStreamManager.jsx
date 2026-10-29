import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import { liveStreamApi } from '../services/api';
import SidePanel from '../SidePanel/SidePanel';

const LiveStreamManager = () => {
  const [liveStreams, setLiveStreams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    url_stream: '',
    descripcion: '',
    activo: true
  });

  useEffect(() => {
    cargarLiveStream();
  }, []);

  const cargarLiveStream = async () => {
    try {
      const data = await liveStreamApi.list();
      setLiveStreams(Array.isArray(data) ? data : []);
      setLoadError('');
    } catch (err) {
      setLiveStreams([]);
      setLoadError(err.message || 'No se pudo conectar con la API.');
      console.error('No se pudieron cargar las transmisiones desde la base de datos:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.url_stream.trim()) {
      alert('Título y URL del stream son requeridos');
      return;
    }

    try {
      if (editingStream) {
        await liveStreamApi.update(editingStream.id, {
          ...formData,
          titulo: formData.titulo.trim(),
          url_stream: formData.url_stream.trim(),
          descripcion: formData.descripcion.trim()
        });
      } else {
        await liveStreamApi.create({
          ...formData,
          titulo: formData.titulo.trim(),
          url_stream: formData.url_stream.trim(),
          descripcion: formData.descripcion.trim()
        });
      }
      await cargarLiveStream();
      alert(editingStream ? 'Live stream actualizado en la base de datos.' : 'Live stream guardado en la base de datos.');
    } catch (err) {
      console.error(err);
      alert(`No se pudo guardar el live stream: ${err.message || 'Error del servidor'}`);
      return;
    }

    resetForm();
  };

  const handleEdit = (stream) => {
    setFormData({
      titulo: stream.titulo || '',
      url_stream: stream.url_stream || '',
      descripcion: stream.descripcion || '',
      activo: Boolean(stream.activo)
    });
    setEditingStream(stream);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este live stream?')) return;
    try {
      await liveStreamApi.remove(id);
      await cargarLiveStream();
      alert('Live stream eliminado de la base de datos.');
    } catch (err) {
      alert(`No se pudo eliminar el live stream: ${err.message || 'Error del servidor'}`);
    }
  };

  const handleActivate = async (id) => {
    try {
      await liveStreamApi.activate(id);
      await cargarLiveStream();
      alert('Live stream activado.');
    } catch (err) {
      alert(`No se pudo activar el live stream: ${err.message || 'Error del servidor'}`);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await liveStreamApi.deactivate(id);
      await cargarLiveStream();
      alert('Live stream desactivado.');
    } catch (err) {
      alert(`No se pudo desactivar el live stream: ${err.message || 'Error del servidor'}`);
    }
  };

  const handleCreate = () => {
    setEditingStream(null);
    setFormData({ titulo: '', url_stream: '', descripcion: '', activo: true });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      url_stream: '',
      descripcion: '',
      activo: true
    });
    setEditingStream(null);
    setShowForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="manager-container"
    >
      <div className="manager-header">
        <div className="header-left">
          <h2>Gestión de Live Stream</h2>
          <p>Administra las transmisiones en vivo</p>
        </div>
        <div className="header-actions">
          <button
            onClick={handleCreate}
            className="primary-btn"
          >
            <Plus className="icon" />
            Nuevo Live Stream
          </button>
        </div>
      </div>

      <div className="content">
        {liveStreams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📺</div>
            <h3>No hay live streams</h3>
            <p>{loadError || 'Crea tu primer live stream para comenzar'}</p>
            <button
              onClick={handleCreate}
              className="primary-btn"
            >
              <Plus className="icon" />
              Crear Live Stream
            </button>
          </div>
        ) : (
          <div className="items-grid">
            {liveStreams.map((stream) => (
              <div key={stream.id} className="item-card">
                <div className="card-content">
                  <div className="card-header">
                    <h3>{stream.titulo}</h3>
                    <div className="card-badges">
                      {stream.activo ? (
                        <span className="badge active">
                          <Eye className="icon" />
                          Activo
                        </span>
                      ) : (
                        <span className="badge inactive">
                          <EyeOff className="icon" />
                          Inactivo
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="card-description">
                    <p><strong>URL:</strong> {stream.url_stream}</p>
                    {stream.descripcion && (
                      <p><strong>Descripción:</strong> {stream.descripcion}</p>
                    )}
                  </div>

                  <div className="card-meta">
                    <div className="meta-item">
                      <span>
                        Creado: {new Date(stream.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  {stream.activo ? (
                    <button
                      onClick={() => handleDeactivate(stream.id)}
                      className="action-btn deactivate"
                      title="Desactivar"
                    >
                      <EyeOff className="icon" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(stream.id)}
                      className="action-btn activate"
                      title="Activar"
                    >
                      <Eye className="icon" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(stream)}
                    className="action-btn edit"
                    title="Editar"
                  >
                    <Edit className="icon" />
                  </button>
                  <button
                    onClick={() => handleDelete(stream.id)}
                    className="action-btn delete"
                    title="Eliminar"
                  >
                    <Trash2 className="icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SidePanel
        isOpen={showForm}
        onClose={resetForm}
        title={editingStream ? 'Editar Live Stream' : 'Nuevo Live Stream'}
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="form-input"
              placeholder="Ej: Sachauzumaki"
              required
            />
          </div>

          <div className="form-group">
            <label>URL del Stream *</label>
            <input
              type="url"
              value={formData.url_stream}
              onChange={(e) => setFormData({ ...formData, url_stream: e.target.value })}
              className="form-input"
              placeholder="https://player.kick.com/sachauzumaki?hideHeader=true&hideChat=true"
              required
            />
            <div className="form-help">
              URL completa del stream (iframe, embed, etc.)
            </div>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="form-textarea"
              placeholder="Descripción del live stream..."
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              />
              <span>Stream activo</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={resetForm} className="secondary-btn">
              Cancelar
            </button>
            <button type="submit" className="primary-btn">
              {editingStream ? 'Actualizar' : 'Crear'} Live Stream
            </button>
          </div>
        </form>
      </SidePanel>
    </motion.div>
  );
};

export default LiveStreamManager; 
