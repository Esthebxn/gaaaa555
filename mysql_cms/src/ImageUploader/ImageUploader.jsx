import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link, X } from 'lucide-react';
import { API_URL, uploadImage } from '../services/api';

const resolvePreviewUrl = (value) => {
  if (!value || /^(https?:|data:|blob:|\/\/)/i.test(value)) return value;
  const apiOrigin = new URL(API_URL, window.location.origin).origin;
  const path = value.replace(/^\/+/, '');
  return `${apiOrigin}/${path.includes('/') ? path : `uploads/${path}`}`;
};

const ImageUploader = ({ 
  value = '', 
  onChange, 
  placeholder = "Selecciona una imagen o ingresa una URL",
  className = "",
  accept = "image/*",
  onUploadingChange
}) => {
  const [uploadMode, setUploadMode] = useState('url'); // 'url' o 'file'
  const [preview, setPreview] = useState(value);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const handleModeChange = (mode) => {
    setUploadMode(mode);
  };

  const handleUrlChange = (url) => {
    setPreview(url);
    onChange(url);
  };

  const handleFileSelect = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const uploaded = await uploadImage(file);
      setPreview(uploaded.url);
      onChange(uploaded.url);
    } catch (error) {
      window.alert(error.message || 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`image-uploader ${className}`}>
      {/* Modo selector */}
      <div className="upload-mode-selector">
        <button
          type="button"
          className={`mode-btn ${uploadMode === 'url' ? 'active' : ''}`}
          onClick={() => handleModeChange('url')}
        >
          <Link className="icon" />
          URL
        </button>
        <button
          type="button"
          className={`mode-btn ${uploadMode === 'file' ? 'active' : ''}`}
          onClick={() => handleModeChange('file')}
        >
          <Upload className="icon" />
          Subir Archivo
        </button>
      </div>

      {/* URL Input */}
      {uploadMode === 'url' && (
        <div className="url-input-section">
          <input
            type="text"
            inputMode="url"
            maxLength={500}
            value={value}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={placeholder}
            className="form-input"
          />
        </div>
      )}

      {/* File Upload */}
      {uploadMode === 'file' && (
        <div
          className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
          disabled={uploading}
            className="file-input"
            style={{ display: 'none' }}
          />
          
          <div className="upload-content">
            <Upload className="upload-icon" />
            <p className="upload-text">
              {uploading ? 'Subiendo imagen…' : dragActive ? 'Suelta la imagen aquí' : 'Haz clic o arrastra una imagen'}
            </p>
            <p className="upload-hint">
              PNG, JPG, GIF hasta 10MB
            </p>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="image-preview">
          <div className="preview-header">
            <span className="preview-label">Vista previa:</span>
            <button
              type="button"
              onClick={clearImage}
              className="clear-btn"
              title="Eliminar imagen"
            >
              <X className="icon" />
            </button>
          </div>
          <div className="preview-image">
            <img key={preview} src={resolvePreviewUrl(preview)} alt="Vista previa de la imagen" onError={(event) => { event.currentTarget.hidden = true; }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
