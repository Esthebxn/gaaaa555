const express = require('express');
const router = express.Router();
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const path = require('path');

// Ruta para subir una imagen
router.post('/image', uploadSingle, handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No se ha seleccionado ningún archivo' 
      });
    }

    // Generar URL pública de la imagen
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Imagen subida correctamente',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: imageUrl
      }
    });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al subir la imagen' 
    });
  }
});

// Ruta para eliminar una imagen
router.delete('/image/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads', filename);
    
    // Verificar si el archivo existe
    const fs = require('fs');
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      res.json({
        success: true,
        message: 'Imagen eliminada correctamente'
      });
    } else {
      res.status(404).json({
        error: 'Imagen no encontrada'
      });
    }
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al eliminar la imagen' 
    });
  }
});

module.exports = router;
