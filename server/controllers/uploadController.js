const { uploadImage, uploadImages } = require('../services/cloudinaryService');

exports.uploadSingle = async (req, res) => {
  try {
    const { file, folder } = req.body;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const upload = await uploadImage(file, { folder });
    return res.status(201).json({
      success: true,
      data: {
        url: upload.secure_url,
        publicId: upload.public_id,
      },
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error.response?.data || error.message);
    return res.status(error.status || 500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message || 'Image upload failed',
    });
  }
};

exports.uploadMultiple = async (req, res) => {
  try {
    const { files, folder } = req.body;
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one image file is required' });
    }

    const urls = await uploadImages(files, { folder });
    return res.status(201).json({ success: true, data: { urls } });
  } catch (error) {
    console.error('Cloudinary multi-upload error:', error.response?.data || error.message);
    return res.status(error.status || 500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message || 'Image upload failed',
    });
  }
};
