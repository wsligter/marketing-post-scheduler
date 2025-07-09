const cloudinary = require('../config/cloudinary');
const fs = require('fs');

/**
 * Uploads an image to Cloudinary
 * @param {string} imagePath - Local path to the image file
 * @returns {Promise<Object>} - Cloudinary upload response
 */
const uploadImage = async (imagePath) => {
  try {
    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'marketing_tool_uploads',
      use_filename: true,
      unique_filename: true
    });
    
    // Delete the local file after successful upload
    fs.unlinkSync(imagePath);
    
    return result;
  } catch (error) {
    // If upload fails, throw the error
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
};

/**
 * Deletes an image from Cloudinary
 * @param {string} imageUrl - Cloudinary URL of the image to delete
 * @returns {Promise<Object>} - Cloudinary deletion response
 */
const deleteImage = async (imageUrl) => {
  try {
    // Extract the public ID from the Cloudinary URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return { result: 'not_cloudinary_url' };
    }
    
    // Extract the public ID from the URL
    // First, find the upload part of the URL
    const uploadIndex = imageUrl.indexOf('/upload/');
    if (uploadIndex === -1) {
      console.error('Could not find /upload/ in Cloudinary URL:', imageUrl);
      return { result: 'invalid_cloudinary_url' };
    }
    
    // Get everything after /upload/ (including version number)
    const afterUpload = imageUrl.substring(uploadIndex + 8); // +8 to skip '/upload/'
    
    // Split by '/' to get version and path parts
    const parts = afterUpload.split('/');
    
    // Skip the version part (starts with 'v') and join the rest
    let publicId;
    if (parts[0].startsWith('v')) {
      // If there's a version number, skip it
      publicId = parts.slice(1).join('/');
    } else {
      // No version number
      publicId = afterUpload;
    }
    
    // Remove file extension if present
    if (publicId.includes('.')) {
      publicId = publicId.substring(0, publicId.lastIndexOf('.'));
    }
    
    console.log('Extracted public ID:', publicId);
    
    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary deletion result:', result);
    return result;
  } catch (error) {
    console.error(`Failed to delete image from Cloudinary: ${error.message}`);
    // We don't throw here to prevent API failures if image deletion fails
    return { result: 'error', error: error.message };
  }
};

module.exports = { uploadImage, deleteImage };
