import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

const FileUploader = ({ onFileSelected, selectedFile, onClearFile }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const validateFile = (file) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert("Invalid format. Please upload PNG, JPG, JPEG, or WEBP.");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">Upload Product Damage Image (Optional - OpenCV Analysis)</label>
      
      {!selectedFile ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragOver ? 'var(--primary-light)' : '#f8fafc',
            transition: 'all 0.15s ease'
          }}
        >
          <UploadCloud size={32} color="#64748b" style={{ margin: '0 auto 8px auto' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Drag & drop damage photo here, or <span style={{ color: 'var(--primary)' }}>browse</span>
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Supports PNG, JPG, WEBP (Max 10MB)
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ImageIcon size={24} color="var(--primary)" />
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{selectedFile.name}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearFile}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
