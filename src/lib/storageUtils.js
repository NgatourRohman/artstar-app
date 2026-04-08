/**
 * Extracts the file path from a Supabase storage public URL.
 * It handles optional query parameters and ensures the path is clean for Supabase.remove().
 * 
 * @param {string} publicUrl 
 * @param {string} bucketName 
 * @returns {string|null} The relative path within the bucket
 */
export function extractFilePath(publicUrl, bucketName) {
  if (!publicUrl) return null;
  
  try {
    const url = new URL(publicUrl);
    // Remove query parameters from the path
    const cleanPath = url.pathname;
    
    const searchString = `/public/${bucketName}/`;
    const index = cleanPath.indexOf(searchString);
    
    if (index !== -1) {
      // Decode the URL part to handle spaces or special characters correctly
      return decodeURIComponent(cleanPath.substring(index + searchString.length));
    }
    
    return null;
  } catch (err) {
    console.error('Error extracting file path:', err);
    return null;
  }
}
