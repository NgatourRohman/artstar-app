/**
 * Compresses an image file on the client-side.
 * 
 * @param {File} file The original image file
 * @param {Object} options Options for compression
 * @param {number} options.maxWidth Max width of the resulting image
 * @param {number} options.maxHeight Max height of the resulting image
 * @param {number} options.quality Quality from 0 to 1 (e.g., 0.7)
 * @returns {Promise<Blob>} The compressed image blob
 */
export async function compressImage(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.75 } = {}) {
  // If not an image, skip compression
  if (!file.type.startsWith('image/')) return file;
  
  // If it's a small file already, skip compression (e.g., < 200KB)
  if (file.size < 200 * 1024) return file;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob (JPEG is usually much smaller than PNG for photos)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Ensure we return the same name as original for better metadata
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file); // Fallback to original on error
    };
    reader.onerror = () => resolve(file); // Fallback to original on error
  });
}
