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

    // Clean up previous preview URL to save memory
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageSelect(file);
    
    // RESET input value so the same file can be selected again
    e.target.value = '';
  };

  const handleClear = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
    onClear?.();
  };

  return (
    <div className="image-uploader" onClick={() => inputRef.current?.click()}>
      {previewUrl ? (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <img src={previewUrl} alt="Preview" className="image-uploader-preview" />
          <div className="image-uploader-replace-overlay">
            <Camera size={24} />
            <span>{t('common.change_image', 'Ganti Gambar')}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            className="image-uploader-clear-btn"
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
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'none' }}
      />
    </div>
  );
}
