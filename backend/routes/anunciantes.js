const express = require('express');
const router = express.Router();

// GET - Obtener todos los anunciantes
router.get('/', (req, res) => {
  const { activo } = req.query;
  let query = 'SELECT * FROM anunciantes';
  let conditions = [];
  let values = [];
  
  if (activo !== undefined) {
    conditions.push('activo = ?');
    values.push(activo === 'true');
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY created_at DESC';
  
  global.db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error al obtener anunciantes:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.json(results);
  });
});

// GET - Obtener anunciante por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM anunciantes WHERE id = ?';
  
  global.db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener anunciante por ID:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontró el anunciante' });
    }
    
    res.json(results[0]);
  });
});

// GET - Obtener anunciantes activos
router.get('/activos/list', (req, res) => {
  const query = 'SELECT * FROM anunciantes WHERE activo = true ORDER BY nombre_empresa';
  
  global.db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener anunciantes activos:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.json(results);
  });
});

// POST - Crear nuevo anunciante
router.post('/', (req, res) => {
  const { 
    nombre_empresa, 
    contacto, 
    telefono, 
    email, 
    direccion, 
    descripcion, 
    logo_url, 
    sitio_web, 
    activo,
    nombre,
    categoria,
    horario,
    imagen,
    flyer
  } = req.body;
  
  if (!nombre_empresa) {
    return res.status(400).json({ error: 'El nombre de la empresa es requerido' });
  }
  
  const query = `INSERT INTO anunciantes 
    (nombre_empresa, contacto, telefono, email, direccion, descripcion, logo_url, sitio_web, activo, nombre, categoria, horario, imagen, flyer) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const values = [
    nombre_empresa, 
    contacto, 
    telefono, 
    email, 
    direccion, 
    descripcion, 
    logo_url, 
    sitio_web, 
    activo !== false,
    nombre,
    categoria,
    horario,
    imagen,
    flyer
  ];
  
  global.db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al crear anunciante:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.status(201).json({ 
      message: 'Anunciante creado exitosamente',
      id: result.insertId 
    });
  });
});

// PUT - Actualizar anunciante
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { 
    nombre_empresa, 
    contacto, 
    telefono, 
    email, 
    direccion, 
    descripcion, 
    logo_url, 
    sitio_web, 
    activo,
    nombre,
    categoria,
    horario,
    imagen,
    flyer
  } = req.body;
  
  if (!nombre_empresa) {
    return res.status(400).json({ error: 'El nombre de la empresa es requerido' });
  }
  
  const query = `UPDATE anunciantes SET 
    nombre_empresa = ?, contacto = ?, telefono = ?, email = ?, direccion = ?, 
    descripcion = ?, logo_url = ?, sitio_web = ?, activo = ?, 
    nombre = ?, categoria = ?, horario = ?, imagen = ?, flyer = ? 
    WHERE id = ?`;
  
  const values = [
    nombre_empresa, 
    contacto, 
    telefono, 
    email, 
    direccion, 
    descripcion, 
    logo_url, 
    sitio_web, 
    activo,
    nombre,
    categoria,
    horario,
    imagen,
    flyer,
    id
  ];
  
  global.db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al actualizar anunciante:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No se encontró el anunciante para actualizar' });
    }
    
    res.json({ message: 'Anunciante actualizado exitosamente' });
  });
});

// DELETE - Eliminar anunciante
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM anunciantes WHERE id = ?';
  
  global.db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar anunciante:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No se encontró el anunciante para eliminar' });
    }
    
    res.json({ message: 'Anunciante eliminado exitosamente' });
  });
});

module.exports = router;
