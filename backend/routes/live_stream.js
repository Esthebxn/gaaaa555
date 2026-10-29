const express = require('express');
const router = express.Router();

// GET - Obtener live stream activo
router.get('/', (req, res) => {
  const query = 'SELECT * FROM live_stream WHERE activo = TRUE ORDER BY id DESC LIMIT 1';
  
  global.db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener live stream:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontró live stream activo' });
    }
    
    res.json(results[0]);
  });
});

// GET - Obtener todos los live streams
router.get('/all', (req, res) => {
  const query = 'SELECT * FROM live_stream ORDER BY created_at DESC';
  
  global.db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener live streams:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.json(results);
  });
});

// GET - Obtener live stream por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM live_stream WHERE id = ?';
  
  global.db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener live stream:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Live stream no encontrado' });
    }
    
    res.json(results[0]);
  });
});

// POST - Crear nuevo live stream
router.post('/', (req, res) => {
  const { titulo, url_stream, descripcion, activo } = req.body;
  
  // Validaciones básicas
  if (!titulo || !url_stream) {
    return res.status(400).json({ error: 'Título y URL del stream son requeridos' });
  }
  
  // Si se va a activar este stream, desactivar todos los demás primero
  if (activo !== false) {
    const deactivateQuery = 'UPDATE live_stream SET activo = FALSE';
    global.db.query(deactivateQuery, (err) => {
      if (err) {
        console.error('Error al desactivar otros streams:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      // Ahora crear el nuevo stream como activo
      const query = 'INSERT INTO live_stream (titulo, url_stream, descripcion, activo) VALUES (?, ?, ?, ?)';
      const values = [titulo, url_stream, descripcion || '', true];
      
      global.db.query(query, values, (err, result) => {
        if (err) {
          console.error('Error al crear live stream:', err);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.status(201).json({ 
          message: 'Live stream creado exitosamente', 
          id: result.insertId 
        });
      });
    });
  } else {
    // Si no se va a activar, crear como inactivo
    const query = 'INSERT INTO live_stream (titulo, url_stream, descripcion, activo) VALUES (?, ?, ?, ?)';
    const values = [titulo, url_stream, descripcion || '', false];
    
    global.db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error al crear live stream:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      res.status(201).json({ 
        message: 'Live stream creado exitosamente', 
        id: result.insertId 
      });
    });
  }
});

// PUT - Actualizar live stream
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, url_stream, descripcion, activo } = req.body;
  
  // Validaciones básicas
  if (!titulo || !url_stream) {
    return res.status(400).json({ error: 'Título y URL del stream son requeridos' });
  }
  
  // Si se va a activar este stream, desactivar todos los demás primero
  if (activo === true) {
    const deactivateQuery = 'UPDATE live_stream SET activo = FALSE WHERE id != ?';
    global.db.query(deactivateQuery, [id], (err) => {
      if (err) {
        console.error('Error al desactivar otros streams:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      // Ahora actualizar este stream como activo
      const query = 'UPDATE live_stream SET titulo = ?, url_stream = ?, descripcion = ?, activo = ? WHERE id = ?';
      const values = [titulo, url_stream, descripcion || '', true, id];
      
      global.db.query(query, values, (err, result) => {
        if (err) {
          console.error('Error al actualizar live stream:', err);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Live stream no encontrado' });
        }
        
        res.json({ message: 'Live stream actualizado exitosamente' });
      });
    });
  } else {
    // Si no se va a activar, actualizar normalmente
    const query = 'UPDATE live_stream SET titulo = ?, url_stream = ?, descripcion = ?, activo = ? WHERE id = ?';
    const values = [titulo, url_stream, descripcion || '', activo !== undefined ? activo : false, id];
    
    global.db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error al actualizar live stream:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Live stream no encontrado' });
      }
      
      res.json({ message: 'Live stream actualizado exitosamente' });
    });
  }
});

// PATCH - Activar/desactivar live stream (solo uno activo a la vez)
router.patch('/:id/activate', (req, res) => {
  const { id } = req.params;
  
  // Primero desactivar todos los demás
  const deactivateQuery = 'UPDATE live_stream SET activo = FALSE';
  global.db.query(deactivateQuery, (err) => {
    if (err) {
      console.error('Error al desactivar otros streams:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    // Ahora activar este stream
    const activateQuery = 'UPDATE live_stream SET activo = TRUE WHERE id = ?';
    global.db.query(activateQuery, [id], (err, result) => {
      if (err) {
        console.error('Error al activar live stream:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Live stream no encontrado' });
      }
      
      res.json({ message: 'Live stream activado exitosamente' });
    });
  });
});

// PATCH - Desactivar live stream
router.patch('/:id/deactivate', (req, res) => {
  const { id } = req.params;
  const query = 'UPDATE live_stream SET activo = FALSE WHERE id = ?';
  
  global.db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al desactivar live stream:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Live stream no encontrado' });
    }
    
    res.json({ message: 'Live stream desactivado exitosamente' });
  });
});

// DELETE - Eliminar live stream
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM live_stream WHERE id = ?';
  
  global.db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar live stream:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Live stream no encontrado' });
    }
    
    res.json({ message: 'Live stream eliminado exitosamente' });
  });
});

module.exports = router;
