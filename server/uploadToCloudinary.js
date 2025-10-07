import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file to Cloudinary
 * @param {Buffer} photoBuffer - The file buffer to upload
 * @param {string} fileName - The name to give the uploaded file
 * @returns {Promise<string>} - The secure URL of the uploaded file
 */
async function uploadToCloudinary(photoBuffer, fileName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: 'my-app',
        public_id: fileName,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('Error uploading to Cloudinary:', error);
          reject(error);
        } else {
          console.log('Successfully uploaded to Cloudinary:', result.secure_url);
          resolve(result.secure_url);
        }
      }
    );
    
    uploadStream.end(photoBuffer);
  });
}

export default uploadToCloudinary;