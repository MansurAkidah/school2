//const cloudinary = require('cloudinary').v2;
import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadToCloudinary(photoBuffer, fileName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: 'my-app',
        public_id: fileName,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(photoBuffer);
  });
}

export default uploadToCloudinary;