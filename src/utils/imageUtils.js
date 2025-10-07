/**
 * Returns the appropriate image URL based on the source
 * @param {string} imagePath - The image path from the database
 * @returns {string} - The complete image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If the path already starts with http, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a local path, prepend the base URL
  return `https://school2-vdpi.onrender.com${imagePath}`;
};
