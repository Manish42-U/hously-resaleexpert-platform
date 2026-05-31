const PropertyRepository = require('../repositories/PropertyRepository');
const AppSettingsService = require('../services/AppSettingsService');
const { cloudinaryUrlFromImage } = require('../services/cloudinaryService');

const PLACEHOLDER_VALUES = new Set([
  'owner',
  'property owner',
  'not specified',
  'not provided',
  'not-provided@resaleexpert.in',
  'owner@resaleexpert.in',
]);

const realText = (value) => {
  const text = String(value ?? '').trim();
  return text && !PLACEHOLDER_VALUES.has(text.toLowerCase()) ? text : '';
};

const validatePropertyPayload = (payload) => {
  const errors = [];
  const owner = payload.ownerDetails || payload.owner_details || {};
  const ownerName = realText(payload.fullName || payload.full_name || owner.fullName || owner.full_name);
  const email = realText(payload.email || owner.email);
  const phone = realText(payload.phone || owner.phone);

  if (!ownerName) errors.push('Owner name is required.');
  if (!email || !email.includes('@')) errors.push('Valid owner email is required.');
  if (!phone || phone.replace(/\D/g, '').length < 8) errors.push('Valid owner phone is required.');
  if (!realText(payload.title)) errors.push('Property title is required.');
  if (!realText(payload.location)) errors.push('Property location is required.');
  if (Number(payload.price || 0) <= 0) errors.push('Property price must be greater than zero.');
  if (Number(payload.carpetArea || payload.carpet_area || 0) <= 0) errors.push('Carpet area must be greater than zero.');

  return errors;
};

const withCloudinaryImages = async (payload) => {
  const data = { ...payload };
  const originalImages = Array.isArray(data.images) ? data.images : [];
  const mainImage = data.imageUrl || data.image_url;

  if (originalImages.length > 0) {
    data.images = await Promise.all(
      originalImages.map((image) => cloudinaryUrlFromImage(image, 'hously/properties')),
    );
  }

  if (mainImage) {
    const firstImageMatchesMain = originalImages[0] && originalImages[0] === mainImage;
    const cloudinaryUrl = firstImageMatchesMain && data.images?.[0]
      ? data.images[0]
      : await cloudinaryUrlFromImage(mainImage, 'hously/properties');
    data.imageUrl = cloudinaryUrl;
    data.image_url = cloudinaryUrl;
  } else if (data.images?.[0]) {
    data.imageUrl = data.images[0];
    data.image_url = data.images[0];
  }

  const ownershipDocument = data.ownershipDocument || data.ownership_document;
  if (ownershipDocument) {
    data.ownershipDocument = await cloudinaryUrlFromImage(ownershipDocument, 'hously/property-documents');
    data.ownership_document = data.ownershipDocument;
  }

  return data;
};

exports.createProperty = async (req, res) => {
  try {
    const settings = await AppSettingsService.getSettings();
    const validationErrors = validatePropertyPayload(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Please complete required property details.',
        errors: validationErrors,
      });
    }

    const payload = await withCloudinaryImages({
      ...req.body,
      status: req.body.status || (settings.publishApprovalRequired ? 'Under Review' : 'Available'),
    });
    const result = await PropertyRepository.create(payload);
    res.status(201).json({
      success: true,
      message: 'Property listed successfully!',
      propertyId: result.insertId
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    const statusFilter = req.query.status;
    let properties = await PropertyRepository.findAll();

    if (!showAll) {
      if (statusFilter && statusFilter !== 'all') {
        properties = properties.filter(p => p.status === statusFilter);
      } else {
        // By default, only return 'Available' (published) properties to the public
        properties = properties.filter(p => p.status === 'Available');
      }
    } else if (statusFilter && statusFilter !== 'all') {
      properties = properties.filter(p => p.status === statusFilter);
    }

    res.status(200).json({ success: true, data: properties, count: properties.length });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await PropertyRepository.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    return res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.error('Error fetching property:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const validationErrors = validatePropertyPayload(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Please complete required property details.',
        errors: validationErrors,
      });
    }

    const payload = await withCloudinaryImages(req.body);
    const result = await PropertyRepository.update(req.params.id, payload);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    return res.status(200).json({ success: true, message: 'Property updated successfully' });
  } catch (error) {
    console.error('Error updating property:', error);
    return res.status(500).json({ success: false, message: 'Error updating property' });
  }
};

exports.incrementPropertyViews = async (req, res) => {
  try {
    const result = await PropertyRepository.incrementViews(req.params.id);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const property = await PropertyRepository.findById(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Property view recorded',
      data: { views: property?.views || 0, property },
    });
  } catch (error) {
    console.error('Error incrementing property views:', error);
    return res.status(500).json({ success: false, message: 'Error updating property views' });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const result = await PropertyRepository.delete(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting property' });
  }
};
