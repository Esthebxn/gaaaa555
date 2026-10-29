const express = require('express');
const router = express.Router();

const CAMPOS_TEXTO = [
  'titulo', 'descripcion', 'mision', 'vision', 'valores', 'imagen_url',
  'nombre_empresa', 'slogan', 'email', 'telefono', 'historia', 'equipo'
];
const CAMPOS_IMAGEN = [
  'banner_imagen', 'equipo_imagen', 'historia_imagen', 'mision_imagen', 'vision_imagen'
];
const CAMPOS = [...CAMPOS_TEXTO, ...CAMPOS_IMAGEN];

// Crea las columnas de imagen si todavía no existen
global.db.query('SHOW COLUMNS FROM nosotros', (err, cols) => {
  if (err) {
    console.error('No se pudo revisar la tabla nosotros:', err.message);
    return;
  }
  const existentes = cols.map((c) => c.Field);
  const faltantes = CAMPOS_IMAGEN.filter((c) => !existentes.includes(c));
  if (faltantes.length === 0) return;

  const sql = 'ALTER TABLE nosotros ' + faltantes.map((c) => 'ADD COLUMN ' + c + ' TEXT NULL').join(', ');
  global.db.query(sql, (alterErr) => {
    if (alterErr) {
      console.error('No se pudieron crear las columnas de imagen:', alterErr.message);
    } else {
      console.log('Columnas creadas en nosotros: ' + faltantes.join(', '));
    }
  });
});

// GET - Obtener información de nosotros
router.get('/', (req, res) => {
  const query = 'SELECT * FROM nosotros ORDER BY id DESC LIMIT 1';

  global.db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener datos de nosotros:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontró información de nosotros' });
    }

    res.json(results[0]);
  });
});

// GET - Obtener todos los registros de nosotros
router.get('/all', (req, res) => {
  const query = 'SELECT * FROM nosotros ORDER BY created_at DESC';

  global.db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener todos los datos de nosotros:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.json(results);
  });
});

// GET - Obtener nosotros por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM nosotros WHERE id = ?';

  global.db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener nosotros por ID:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontró el registro' });
    }

    res.json(results[0]);
  });
});

// POST - Crear nuevo registro de nosotros
router.post('/', (req, res) => {
  if (!req.body.titulo) {
    return res.status(400).json({ error: 'El título es requerido' });
  }

  const campos = CAMPOS.filter((k) => req.body[k] !== undefined);
  const query =
    'INSERT INTO nosotros (' + campos.join(', ') + ') VALUES (' + campos.map(() => '?').join(', ') + ')';
  const values = campos.map((k) => req.body[k]);

  global.db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al crear registro de nosotros:', err);
      return res.status(500).json({
        error: 'Error al crear Nosotros',
        codigo: err.code || 'SIN_CODIGO',
        detalle: err.sqlMessage || err.message
      });
    }

    res.status(201).json({
      message: 'Registro creado exitosamente',
      id: result.insertId
    });
  });
});

// PUT - Actualizar registro de nosotros (solo los campos enviados)
router.put('/:id', (req, res) => {
  const { id } = req.params;

  if (!req.body.titulo) {
    return res.status(400).json({ error: 'El título es requerido' });
  }

  const campos = CAMPOS.filter((k) => req.body[k] !== undefined);
  const query = 'UPDATE nosotros SET ' + campos.map((k) => k + ' = ?').join(', ') + ' WHERE id = ?';
  const values = [...campos.map((k) => req.body[k]), id];

  global.db.query(query, values, (err, result) => {
    if (err) {
      console.error('ERROR MYSQL AL ACTUALIZAR NOSOTROS:', {
        codigo: err.code,
        mensaje: err.message,
        detalle: err.sqlMessage,
        estado: err.sqlState
      });

      return res.status(500).json({
        error: 'Error al actualizar Nosotros',
        codigo: err.code || 'SIN_CODIGO',
        detalle: err.sqlMessage || err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No se encontró el registro para actualizar' });
    }

    res.json({ message: 'Registro actualizado exitosamente' });
  });
});

// DELETE - Eliminar registro de nosotros
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM nosotros WHERE id = ?';

  global.db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar registro de nosotros:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No se encontró el registro para eliminar' });
    }

    res.json({ message: 'Registro eliminado exitosamente' });
  });
});

module.exports = router;