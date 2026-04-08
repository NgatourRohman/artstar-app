import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ImageUploader({ onImageSelect, preview, onClear }) {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState(preview || null);
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageSelect(file);
  };

  const handleClear = () => {
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
    onClear?.();
  };

  return (
    <div className="image-uploader" onClick={() => !previewUrl && inputRef.current?.click()}>
      {previewUrl ? (
        <div style={{ position: 'relative' }}>
          <img src={previewUrl} alt="Preview" className="image-uploader-preview" />
          <button
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <div className="image-uploader-icon">
            <Camera size={40} />
          </div>
          <p className="image-uploader-text">{t('common.upload_image')} 📸</p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
      />
    </div>
  );
}
