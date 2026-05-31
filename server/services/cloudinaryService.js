const crypto = require('crypto');
const axios = require('axios');

const CLOUDINARY_HOST = 'res.cloudinary.com';

const getCloudinaryConfig = () => {
  const url = process.env.CLOUDINARY_URL;
  if (url) {
    const parsed = new URL(url);
    return {
      cloudName: parsed.hostname,
      apiKey: decodeURIComponent(parsed.username),
      apiSecret: decodeURIComponent(parsed.password),
    };
  }

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  };
};

const isCloudinaryUrl = (value = '') => {
  try {
    return new URL(value).hostname === CLOUDINARY_HOST;
  } catch {
    return false;
  }
};

const createSignature = (params, apiSecret) => {
  const toSign = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return crypto.createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex');
};

const uploadImage = async (file, options = {}) => {
  if (!file || typeof file !== 'string') return null;
  if (isCloudinaryUrl(file)) return { secure_url: file };

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  if (!cloudName || !apiKey || !apiSecret) {
    const error = new Error('Cloudinary is not configured on the server');
    error.status = 500;
    throw error;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const uploadParams = {
    folder: options.folder || 'hously/images',
    timestamp,
  };
  const signature = createSignature(uploadParams, apiSecret);
  const body = new URLSearchParams({
    file,
    api_key: apiKey,
    signature,
    ...Object.fromEntries(Object.entries(uploadParams).map(([key, value]) => [key, String(value)])),
  });

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    body,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );

  return response.data;
};

const uploadImages = async (files = [], options = {}) => {
  const values = Array.isArray(files) ? files : [files];
  const uploads = await Promise.all(
    values.filter(Boolean).map((file) => uploadImage(file, options)),
  );
  return uploads.map((upload) => upload.secure_url).filter(Boolean);
};

const cloudinaryUrlFromImage = async (value, folder) => {
  if (!value || typeof value !== 'string' || isCloudinaryUrl(value)) return value;
  const upload = await uploadImage(value, { folder });
  return upload.secure_url;
};

module.exports = {
  cloudinaryUrlFromImage,
  isCloudinaryUrl,
  uploadImage,
  uploadImages,
};
