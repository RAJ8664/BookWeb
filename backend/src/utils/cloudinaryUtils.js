const { cloudinary } = require('../config/cloudinary');

/**
 * Extract public ID from a Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null if not found
 */
const extractPublicId = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return null;
  }
  
  // URL format: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/public_id.ext
  try {
    const splitUrl = url.split('/');
    // Get the last segment which contains the public ID with extension
    const lastSegment = splitUrl[splitUrl.length - 1];
    // Extract the filename without extension
    const publicIdWithFolder = splitUrl.slice(splitUrl.indexOf('upload') + 1).join('/');
    // Remove the version segment if present
    return publicIdWithFolder.replace(/^v\d+\//, '');
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} imageUrl - Cloudinary URL of the image to delete
 * @returns {Promise<boolean>} - True if deleted successfully, false otherwise
 */
const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.includes('cloudinary.com')) {
      return false;
    }
    
    const publicId = extractPublicId(imageUrl);
    if (!publicId) {
      return false;
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};

module.exports = {
  deleteImage,
  extractPublicId
}; 