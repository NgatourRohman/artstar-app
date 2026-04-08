/**
 * Extracts the file path from a Supabase storage public URL.
 * URL format: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
 * 
 * @param {string} publicUrl 
 * @param {string} bucketName 
 * @returns {string|null} The relative path within the bucket
 */
export function extractFilePath(publicUrl, bucketName) {
  if (!publicUrl) return null;
  
  try {
    const parts = publicUrl.split(`/public/${bucketName}/`);
    if (parts.length > 1) {
      return parts[1];
    }
    return null;
  } catch (err) {
    console.error('Error extracting file path:', err);
    return null;
  }
}
