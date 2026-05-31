const CmsRepository = require('../repositories/CmsRepository');

exports.getAllContent = async (req, res) => {
  try {
    const rows = await CmsRepository.findAllContent();
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('getAllContent error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch CMS content' });
  }
};

exports.getContentByKey = async (req, res) => {
  try {
    const content = await CmsRepository.findByKey(req.params.key);
    if (!content) {
      return res.status(404).json({ success: false, message: 'CMS content not found' });
    }
    return res.json({ success: true, data: content });
  } catch (error) {
    console.error('getContentByKey error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch CMS content' });
  }
};

exports.saveContent = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      return res.status(400).json({ success: false, message: 'CMS content must be a JSON object' });
    }

    const saved = await CmsRepository.upsert(req.params.key, { title, content });
    return res.json({ success: true, message: 'CMS content saved', data: saved });
  } catch (error) {
    console.error('saveContent error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save CMS content' });
  }
};
