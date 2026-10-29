const express = require('express');
const router = express.Router();

// GET - Obtener toda la programación
router.get('/', (req, res) => {
  const { dia_semana, categoria, activo } = req.query;
  let query = 'SELECT * FROM programacion';
  let conditions = [];
  let values = [];
  
  if (dia_semana) {
    conditions.push('dia_semana = ?');
    values.push(dia_semana);
  }
  
  if (categoria) {
    conditions.push('categoria = ?');
    values.push(categoria);
  }
  
  if (activo !== undefined) {
    conditions.push('activo = ?');
    values.push(activo === 'true');
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY dia_semana, horario_inicio';
  
  global.db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error al obtener programación:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.json(results);
  });
});

// GET - Obtener programación por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM programacion WHERE id = ?';
  
  global.db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener programación por ID:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontró el programa' });
    }
    
    res.json(results[0]);
  });
});

// GET - Obtener programación por día
router.get('/dia/:dia', (req, res) => {
  const { dia } = req.params;
  const query = 'SELECT * FROM programacion WHERE dia_semana = ? AND activo = true ORDER BY horario_inicio';
  
  global.db.query(query, [dia], (err, results) => {
    if (err) {
      console.error('Error al obtener programación por día:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.json(results);
  });
});

// GET - Obtener programación de la semana
router.get('/semana/actual', (req, res) => {
  const query = `SELECT * FROM programacion 
    WHERE activo = true 
    ORDER BY 
      CASE dia_semana 
        WHEN 'Lunes' THEN 1
        WHEN 'Martes' THEN 2
        WHEN 'Miércoles' THEN 3
        WHEN 'Jueves' THEN 4
        WHEN 'Viernes' THEN 5
        WHEN 'Sábado' THEN 6
        WHEN 'Domingo' THEN 7
      END, 
      horario_inicio`;
  
  global.db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener programación de la semana:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.json(results);
  });
});

function parsearHorarios(horaStr, hInicio, hFin) {
  let inicio = hInicio;
  let fin = hFin;
  if (!inicio && horaStr) {
    const match = String(horaStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = match[2];
      const ampm = match[3] ? match[3].toUpperCase() : null;
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      inicio = `${String(h).padStart(2, '0')}:${m}:00`;
      let nextH = (h + 1) % 24;
      fin = `${String(nextH).padStart(2, '0')}:${m}:00`;
    } else {
      inicio = '08:00:00';
      fin = '09:00:00';
    }
  }
  if (!fin && inicio) {
    const parts = String(inicio).split(':');
    let h = (parseInt(parts[0], 10) + 1) % 24;
    fin = `${String(h).padStart(2, '0')}:${parts[1] || '00'}:00`;
  }
  return {
    horario_inicio: inicio || '08:00:00',
    horario_fin: fin || '09:00:00'
  };
}

// POST - Crear nuevo programa
router.post('/', (req, res) => {
  const { 
    nombre_programa, 
    descripcion, 
    horario_inicio, 
    horario_fin, 
    dia_semana, 
    conductor, 
    categoria, 
    activo,
    hora,
    programa
  } = req.body;
  
  if (!nombre_programa || !dia_semana) {
    return res.status(400).json({ 
      error: 'El nombre del programa y día de la semana son requeridos' 
    });
  }
  
  const horarios = parsearHorarios(hora, horario_inicio, horario_fin);
  const diaVal = dia_semana.charAt(0).toUpperCase() + dia_semana.slice(1);
  const progVal = programa || nombre_programa;
  
  const query = `INSERT INTO programacion 
    (nombre_programa, descripcion, horario_inicio, horario_fin, dia_semana, conductor, categoria, activo, hora, programa) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const values = [
    nombre_programa, 
    descripcion || '', 
    horarios.horario_inicio, 
    horarios.horario_fin, 
    diaVal, 
    conductor || '', 
    categoria || '', 
    activo !== false,
    hora || '', 
    progVal
  ];
  
  global.db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al crear programa:', err);
      return res.status(500).json({ error: 'Error interno del servidor', message: err.message });
    }
    
    res.status(201).json({ 
      message: 'Programa creado exitosamente',
      id: result.insertId,
      ...req.body,
      horario_inicio: horarios.horario_inicio,
      horario_fin: horarios.horario_fin
    });
  });
});

// PUT - Actualizar programa
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { 
    nombre_programa, 
    descripcion, 
    horario_inicio, 
    horario_fin, 
    dia_semana, 
    conductor, 
    categoria, 
    activo,
    hora,
    programa
  } = req.body;
  if (!nombre_programa || !dia_semana) {
    return res.status(400).json({ 
      error: 'El nombre del programa y día de la semana son requeridos' 
    });
  }
  
  const horarios = parsearHorarios(hora, horario_inicio, horario_fin);
  const diaVal = dia_semana.charAt(0).toUpperCase() + dia_semana.slice(1);
  const progVal = programa || nombre_programa;
  
  const query = `UPDATE programacion SET 
    nombre_programa = ?, descripcion = ?, horario_inicio = ?, horario_fin = ?, 
    dia_semana = ?, conductor = ?, categoria = ?, activo = ?, 
    hora = ?, programa = ? 
    WHERE id = ?`;
  
  const values = [
    nombre_programa, 
    descripcion || '', 
    horarios.horario_inicio, 
    horarios.horario_fin, 
    diaVal, 
    conductor || '', 
    categoria || '', 
    activo !== false,
    hora || '', 
    progVal, 
    id
  ];
  
  global.db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al actualizar programa:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No se encontró el programa para actualizar' });
    }
    
    res.json({ message: 'Programa actualizado exitosamente' });
  });
});

// DELETE - Eliminar programa
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM programacion WHERE id = ?';
  
  global.db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar programa:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No se encontró el programa para eliminar' });
    }
    
    res.json({ message: 'Programa eliminado exitosamente' });
  });
});

module.exports = router;
