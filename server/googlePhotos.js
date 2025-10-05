const fetchImpl = (typeof fetch !== 'undefined') ? fetch : require('node-fetch');

/**
 * Uploads a photo to Google Photos and returns a shareable link
 * @param {Buffer|string} photoData - The photo data (Buffer or base64 string)
 * @param {string} fileName - The name of the file
 * @param {string} mimeType - MIME type (e.g., 'image/jpeg', 'image/png')
 * @returns {Promise<string>} - The shareable link to the uploaded photo
 */
async function uploadToGooglePhotos(photoData, fileName, mimeType = 'image/jpeg') {
  const accessToken = process.env.GOOGLE_PHOTOS_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error('GOOGLE_PHOTOS_ACCESS_TOKEN not found in environment variables');
  }

  try {
    // Step 1: Upload the photo bytes to get an upload token
    const uploadResponse = await fetchImpl('https://photoslibrary.googleapis.com/v1/uploads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
        'X-Goog-Upload-Content-Type': mimeType,
        'X-Goog-Upload-Protocol': 'raw',
      },
      body: Buffer.isBuffer(photoData) ? photoData : Buffer.from(photoData, 'base64')
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadToken = await uploadResponse.text();

    // Step 2: Create the media item in Google Photos library
    const createResponse = await fetchImpl('https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newMediaItems: [
          {
            description: fileName,
            simpleMediaItem: {
              fileName: fileName,
              uploadToken: uploadToken
            }
          }
        ]
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Create media item failed: ${createResponse.status} - ${errorText}`);
    }

    const createResult = await createResponse.json();
    
    if (createResult.newMediaItemResults?.[0]?.status?.message === 'Success') {
      const mediaItem = createResult.newMediaItemResults[0].mediaItem;
      
      // The productUrl is the shareable link
      return mediaItem.productUrl;
    } else {
      throw new Error(`Failed to create media item: ${JSON.stringify(createResult)}`);
    }

  } catch (error) {
    console.error('Error uploading to Google Photos:', error);
    throw error;
  }
}

module.exports = uploadToGooglePhotos;


