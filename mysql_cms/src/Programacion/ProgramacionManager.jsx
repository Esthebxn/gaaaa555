import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { programacionApi } from '../services/api';
import SidePanel from '../SidePanel/SidePanel';
import './ProgramacionManager.css';

const normalizarDia = (dia = '') => dia
  .toLocaleLowerCase('es')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const agruparPorDia = (programas) => {
  const programacionPorDia = {
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: [],
    domingo: []
  };

  programas.forEach(programa => {
    const dia = normalizarDia(programa.dia_semana);
    if (programacionPorDia[dia]) {
      programacionPorDia[dia].push({
        ...programa,
        hora: programa.hora || String(programa.horario_inicio || '').slice(0, 5),
        activo: programa.activo === true || Number(programa.activo) === 1
      });
    }
  });

  return programacionPorDia;
};

function InlineProgramEditor({ formData, setFormData, dias, categorias, onSubmit, onCancel, submitLabel, defaultDay, showCancel = true }) {
  const update = (field, value) => setFormData((current) => ({ ...current, [field]: value }));
  return (
    <form className="inline-program-editor" onSubmit={onSubmit}>
      <div className="inline-program-fields">
        <label>Día<select className="form-select" value={formData.dia_semana || defaultDay} onChange={(event) => update('dia_semana', event.target.value)} required>
          <option value="">Seleccionar día</option>{dias.map((day) => <option key={day.id} value={day.name}>{day.name}</option>)}
        </select></label>
        <label>Hora<input className="form-input" type="time" value={formData.hora} onChange={(event) => update('hora', event.target.value)} required /></label>
        <label className="inline-program-title">Programa<input className="form-input" type="text" value={formData.nombre_programa} onChange={(event) => update('nombre_programa', event.target.value)} placeholder="Nombre del programa" required /></label>
        <label>Categoría<select className="form-select" value={formData.categoria} onChange={(event) => update('categoria', event.target.value)}>
          <option value="">Seleccionar categoría</option>{categorias.map((category) => <option key={category} value={category}>{category}</option>)}
        </select></label>
        <label>Conductor<input className="form-input" type="text" value={formData.conductor} onChange={(event) => update('conductor', event.target.value)} placeholder="Conductor" /></label>
        <label className="inline-program-description">Descripción<textarea className="form-textarea" rows={2} value={formData.descripcion} onChange={(event) => update('descripcion', event.target.value)} placeholder="Descripción del programa" /></label>
      </div>
      <div className="inline-program-footer">
        <label className="inline-program-active"><input type="checkbox" checked={Boolean(formData.activo)} onChange={(event) => update('activo', event.target.checked)} /> Programa activo</label>
        <div className="inline-program-actions">{showCancel && <button type="button" className="secondary-btn" onClick={onCancel}>Cancelar</button>}<button type="submit" className="primary-btn">{submitLabel}</button></div>
      </div>
    </form>
  );
}

const ProgramacionManager = () => {
  const [programas, setProgramas] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [selectedDay, setSelectedDay] = useState('lunes');
  const [showModal, setShowModal] = useState(false);
  const [editingPrograma, setEditingPrograma] = useState(null);
  const [inlineEditId, setInlineEditId] = useState(null);
  const [formData, setFormData] = useState({
    dia_semana: '',
    hora: '',
    nombre_programa: '',
    descripcion: '',
    categoria: '',
    conductor: '',
    activo: true
  });

  useEffect(() => {
    cargarProgramacion();
  }, []);

  const cargarProgramacion = async () => {
    try {
      const data = await programacionApi.list();
      setProgramas(Array.isArray(data) ? data : []);
      setLoadError('');
    } catch (err) {
      setProgramas([]);
      setLoadError(err.message || 'No se pudo conectar con la API.');
      console.error('No se pudo cargar la programación desde la base de datos:', err);
    }
  };

  const dias = [
    { id: 'lunes', name: 'Lunes' },
    { id: 'martes', name: 'Martes' },
    { id: 'miercoles', name: 'Miércoles' },
    { id: 'jueves', name: 'Jueves' },
    { id: 'viernes', name: 'Viernes' },
    { id: 'sabado', name: 'Sábado' },
    { id: 'domingo', name: 'Domingo' }
  ];

  const seleccionarDia = (dia) => {
    setSelectedDay(dia.id);
    setInlineEditId(null);
    setEditingPrograma(null);
    setFormData({ dia_semana: dia.name, hora: '', nombre_programa: '', descripcion: '', categoria: '', conductor: '', activo: true });
  };

  const categorias = [
    'Entretenimiento', 'Noticias', 'Variedades', 'Drama', 'Deportes',
    'Cine', 'Música', 'Cocina', 'Tecnología', 'Documental', 'Salud',
    'Comedia', 'Infantil', 'Familia'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const diaSeleccionado = formData.dia_semana || dias.find((day) => day.id === selectedDay)?.name || '';

    // Validación básica
    if (!formData.nombre_programa.trim()) {
      alert('El nombre del programa es requerido');
      return;
    }
    if (!diaSeleccionado) {
      alert('El día de la semana es requerido');
      return;
    }
    if (!formData.hora) {
      alert('La hora es requerida');
      return;
    }

    const dataToSave = {
      nombre_programa: formData.nombre_programa.trim(),
      descripcion: formData.descripcion.trim(),
      dia_semana: diaSeleccionado,
      conductor: formData.conductor.trim() || '',
      categoria: formData.categoria || '',
      activo: formData.activo,
      hora: formData.hora
    };

    try {
      if (editingPrograma) {
        await programacionApi.update(editingPrograma.id, dataToSave);
      } else {
        await programacionApi.create(dataToSave);
      }
      await cargarProgramacion();
      alert(editingPrograma ? 'Programa actualizado en la base de datos.' : 'Programa guardado en la base de datos.');
    } catch (err) {
      console.error(err);
      alert(`No se pudo guardar el programa: ${err.message || 'Error del servidor'}`);
      return;
    }
    resetForm();
  };

  const handleEdit = (programa) => {
    setEditingPrograma(programa);
    setInlineEditId(programa.id);
    setFormData({
      dia_semana: programa.dia_semana || '',
      hora: programa.horario_inicio || programa.hora || '',
      nombre_programa: programa.nombre_programa || '',
      descripcion: programa.descripcion || '',
      categoria: programa.categoria || '',
      conductor: programa.conductor || '',
      activo: programa.activo === true || Number(programa.activo) === 1
    });
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este programa?')) {
      try {
        await programacionApi.remove(id);
        await cargarProgramacion();
        alert('Programa eliminado de la base de datos.');
      } catch (err) {
        alert(`No se pudo eliminar el programa: ${err.message || 'Error del servidor'}`);
      }
    }
  };

  const handleCreate = () => {
    setEditingPrograma(null);
    setInlineEditId(null);
    setFormData({
      dia_semana: dias.find((day) => day.id === selectedDay)?.name || '',
      hora: '',
      nombre_programa: '',
      descripcion: '',
      categoria: '',
      conductor: '',
      activo: true
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      dia_semana: '',
      hora: '',
      nombre_programa: '',
      descripcion: '',
      categoria: '',
      conductor: '',
      activo: true
    });
    setEditingPrograma(null);
    setInlineEditId(null);
    setShowModal(false);
  };

  const programacion = agruparPorDia(programas);
  const currentDayPrograms = programacion[selectedDay] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="manager-container"
    >
      {/* Header */}
      <div className="manager-header">
        <div className="header-left">
          <h2>Gestión de Programación</h2>
          <p>Administra la programación semanal del canal</p>
        </div>
      </div>

      {/* Day Selector */}
      <div className="day-selector">
        <div className="selector-header">
          <h3>Seleccionar Día</h3>
          <div className="day-navigation">
            <button
              onClick={() => {
                const currentIndex = dias.findIndex(d => d.id === selectedDay);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : dias.length - 1;
                seleccionarDia(dias[prevIndex]);
              }}
              className="nav-btn"
            >
              <ChevronLeft className="icon" />
            </button>
            <button
              onClick={() => {
                const currentIndex = dias.findIndex(d => d.id === selectedDay);
                const nextIndex = currentIndex < dias.length - 1 ? currentIndex + 1 : 0;
                seleccionarDia(dias[nextIndex]);
              }}
              className="nav-btn"
            >
              <ChevronRight className="icon" />
            </button>
          </div>
        </div>
        
        <div className="days-grid">
          {dias.map((dia) => (
            <button
              key={dia.id}
              onClick={() => seleccionarDia(dia)}
              className={`day-btn ${selectedDay === dia.id ? 'active' : ''}`}
            >
              <div className="day-name">{dia.name}</div>
              <div className="day-count">
                {programacion[dia.id]?.length || 0} programas
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Programs List */}
      <div className="programs-section">
        <div className="section-header">
          <h3>Programación - {dias.find(d => d.id === selectedDay)?.name}</h3>
          <span className="program-count">
            {currentDayPrograms.length} programas
          </span>
        </div>

        {loadError && <p className="programacion-load-error">{loadError}</p>}

        {loadError ? null : currentDayPrograms.length > 0 ? (
          <div className="programs-list">
            {currentDayPrograms
              .sort((a, b) => a.hora.localeCompare(b.hora))
              .map((programa, index) => (
                <motion.div
                  key={programa.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="program-item"
                >
                  {inlineEditId === programa.id ? (
                    <InlineProgramEditor
                      formData={formData}
                      setFormData={setFormData}
                      dias={dias}
                      categorias={categorias}
                      onSubmit={handleSubmit}
                      onCancel={() => { setInlineEditId(null); setEditingPrograma(null); }}
                      submitLabel="Guardar cambios"
                    />
                  ) : (
                    <>
                      <div className="program-content">
                        <div className="program-time">
                          <Clock className="icon" />
                          <span className="time-text">{programa.hora}</span>
                        </div>
                        <div className="program-info">
                          <h4 className="program-name">{programa.nombre_programa}</h4>
                          <p className="program-description">{programa.descripcion}</p>
                          <div className="program-tags">
                            {programa.categoria && <span className="tag category">{programa.categoria}</span>}
                            {programa.activo && <span className="tag active">Activo</span>}
                          </div>
                        </div>
                      </div>
                      <div className="program-actions">
                        <button onClick={() => handleEdit(programa)} className="action-btn edit" title="Editar directamente"><Edit className="icon" /></button>
                        <button onClick={() => handleDelete(programa.id)} className="action-btn delete" title="Eliminar"><Trash2 className="icon" /></button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
          </div>
        ) : (
          <div className="programs-empty-list">
            <div className="programs-empty-message">
              <Calendar className="empty-icon" />
              <div><h3>No hay programas</h3><p>Agrega el horario de {dias.find(d => d.id === selectedDay)?.name} aquí mismo. Se guardará en la base de datos.</p></div>
            </div>
            <div className="programs-list">
              <div className="program-item program-item-draft">
                <InlineProgramEditor
                  formData={formData}
                  setFormData={setFormData}
                  dias={dias}
                  categorias={categorias}
                  defaultDay={dias.find((day) => day.id === selectedDay)?.name}
                  onSubmit={handleSubmit}
                  showCancel={false}
                  submitLabel="Guardar horario"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <SidePanel
        isOpen={showModal}
        onClose={resetForm}
        title={editingPrograma ? 'Editar Programa' : 'Nuevo Programa'}
        wide
      >
            <form onSubmit={handleSubmit} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label>Día de la Semana</label>
                  <select
                    value={formData.dia_semana}
                    onChange={(e) => setFormData({...formData, dia_semana: e.target.value})}
                    required
                    className="form-select"
                  >
                    <option value="">Seleccionar día</option>
                    {dias.map(dia => (
                      <option key={dia.id} value={dia.name}>{dia.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData({...formData, hora: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Nombre del Programa</label>
                <input
                  type="text"
                  value={formData.nombre_programa}
                  onChange={(e) => setFormData({...formData, nombre_programa: e.target.value})}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  rows={4}
                  className="form-textarea"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="form-select"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Conductor</label>
                  <input
                    type="text"
                    value={formData.conductor}
                    onChange={(e) => setFormData({...formData, conductor: e.target.value})}
                    className="form-input"
                    placeholder="Nombre del conductor"
                  />
                </div>
              </div>


              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  />
                  <span>Programa activo</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="secondary-btn">
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  {editingPrograma ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
      </SidePanel>
    </motion.div>
  );
};

export default ProgramacionManager;
