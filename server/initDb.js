const db = require('./config/db');
const fs = require('fs');
const path = require('path');
const defaultCmsContent = require('./services/defaultCmsContent');

async function init() {
  try {
    console.log('Connecting to database to initialize tables...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const queries = schema
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    for (const query of queries) {
      await db.execute(query);
    }

    await ensureUserRoleColumn();
    await ensureBlogAuthorColumn();
    await ensurePropertyColumns();
    await backfillPropertyData();
    await backfillNearbyPlacesData();
    await backfillBlogData();
    await ensureCmsContent();
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

async function ensureBlogAuthorColumn() {
  const [tables] = await db.execute(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'blogs'`,
  );

  if (tables.length === 0) return;

  await db.execute(
    'ALTER TABLE blogs MODIFY COLUMN author VARCHAR(100) NOT NULL',
  );
}

async function ensureUserRoleColumn() {
  const [tables] = await db.execute(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'users'`,
  );

  if (tables.length === 0) return;

  await db.execute(
    "ALTER TABLE users MODIFY COLUMN role ENUM('user', 'agent', 'manager', 'admin') DEFAULT 'user'",
  );
}

async function ensurePropertyColumns() {
  const [tables] = await db.execute(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'properties'`,
  );

  if (tables.length === 0) return;

  const columns = [
    ['owner_details', 'JSON'],
    ['location_details', 'JSON'],
    ['pricing_details', 'JSON'],
    ['timeline_details', 'JSON'],
    ['legal_details', 'JSON'],
    ['nearby_places', 'JSON'],
    ['ownership_document', 'LONGTEXT'],
  ];

  for (const [name, definition] of columns) {
    const [existing] = await db.execute(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'properties'
         AND COLUMN_NAME = ?`,
      [name],
    );

    if (existing.length === 0) {
      console.log(`Adding properties.${name}`);
      await db.execute(`ALTER TABLE properties ADD COLUMN ${name} ${definition}`);
    }
  }
}

async function backfillPropertyData() {
  const [tables] = await db.execute(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'properties'`,
  );

  if (tables.length === 0) return;

  await db.execute(
    "UPDATE properties SET property_code = CONCAT('REX', LPAD(id, 4, '0')) WHERE property_code IS NULL OR property_code = ''",
  );
  await db.execute(
    "UPDATE properties SET city = 'Pune' WHERE city IS NULL OR city = ''",
  );
  await db.execute(
    "UPDATE properties SET property_type = 'Residential' WHERE property_type IS NULL OR property_type = ''",
  );
  await db.execute(
    "UPDATE properties SET unit_type = CONCAT(NULLIF(bedrooms, 0), 'BHK') WHERE (unit_type IS NULL OR unit_type = '') AND bedrooms > 0",
  );
  await db.execute(
    "UPDATE properties SET unit_type = 'Property' WHERE unit_type IS NULL OR unit_type = ''",
  );
  await db.execute(
    "UPDATE properties SET subtype = property_type WHERE subtype IS NULL OR subtype = ''",
  );
  await db.execute(
    "UPDATE properties SET location = city WHERE location IS NULL OR location = ''",
  );
  await db.execute(
    "UPDATE properties SET title = TRIM(CONCAT(unit_type, ' ', property_type, ' in ', location)) WHERE title IS NULL OR title = ''",
  );
  await db.execute(
    "UPDATE properties SET per_sq_ft = ROUND(price / carpet_area) WHERE (per_sq_ft IS NULL OR per_sq_ft = 0) AND price > 0 AND carpet_area > 0",
  );
  await db.execute(
    "UPDATE properties SET image_url = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200' WHERE image_url IS NULL OR image_url = ''",
  );
  await db.execute(
    "UPDATE properties SET amenities = JSON_ARRAY('CCTV', 'Elevator', 'Parking', 'Security') WHERE amenities IS NULL OR JSON_LENGTH(amenities) = 0",
  );
  await db.execute(
    "UPDATE properties SET furnishing_items = JSON_ARRAY() WHERE furnishing_items IS NULL",
  );
  await db.execute(
    "UPDATE properties SET owner_details = JSON_OBJECT('fullName', COALESCE(NULLIF(full_name, ''), ''), 'email', COALESCE(NULLIF(email, ''), ''), 'phone', COALESCE(NULLIF(phone, ''), '')) WHERE owner_details IS NULL",
  );
  await db.execute(
    "UPDATE properties SET location_details = JSON_OBJECT('location', location, 'city', city) WHERE location_details IS NULL",
  );
  await db.execute(
    "UPDATE properties SET pricing_details = JSON_OBJECT('price', price, 'carpetArea', carpet_area, 'perSqFt', per_sq_ft, 'negotiable', negotiable) WHERE pricing_details IS NULL",
  );
  await db.execute(
    "UPDATE properties SET timeline_details = JSON_OBJECT() WHERE timeline_details IS NULL",
  );
  await db.execute(
    "UPDATE properties SET legal_details = JSON_OBJECT() WHERE legal_details IS NULL",
  );
  await db.execute(
    "UPDATE properties SET nearby_places = JSON_ARRAY() WHERE nearby_places IS NULL",
  );
  await db.execute(
    "UPDATE properties SET whatsapp = phone WHERE whatsapp IS NULL OR whatsapp = ''",
  );
  await db.execute(
    "UPDATE properties SET executive_name = full_name WHERE executive_name IS NULL OR executive_name = ''",
  );
  await db.execute(
    "UPDATE properties SET executive_role = 'Property Owner' WHERE executive_role IS NULL OR executive_role = ''",
  );
}

async function backfillNearbyPlacesData() {
  const [tables] = await db.execute(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'property_nearby_places'`,
  );

  if (tables.length === 0) return;

  const [properties] = await db.execute(
    `SELECT id, nearby_places
     FROM properties
     WHERE nearby_places IS NOT NULL
       AND JSON_LENGTH(nearby_places) > 0`,
  );

  for (const property of properties) {
    const [existing] = await db.execute(
      'SELECT id FROM property_nearby_places WHERE property_id = ? LIMIT 1',
      [property.id],
    );
    if (existing.length > 0) continue;

    let places = [];
    try {
      places = Array.isArray(property.nearby_places)
        ? property.nearby_places
        : JSON.parse(property.nearby_places || '[]');
    } catch {
      places = [];
    }

    for (const [index, place] of places.entries()) {
      const row = typeof place === 'string' ? { name: place } : place || {};
      const name = String(row.name || row.placeName || row.title || '').trim();
      if (!name) continue;

      await db.execute(
        `INSERT INTO property_nearby_places
          (property_id, name, distance, unit, type, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          property.id,
          name,
          String(row.distance || '').trim() || null,
          String(row.unit || 'km').trim() || 'km',
          String(row.type || row.category || '').trim() || null,
          index,
        ],
      );
    }

    await db.execute(
      'UPDATE properties SET nearby_places = JSON_ARRAY() WHERE id = ?',
      [property.id],
    );
  }
}

async function backfillBlogData() {
  const [tables] = await db.execute(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'blogs'`,
  );

  if (tables.length === 0) return;

  await db.execute(
    "UPDATE blogs SET author = 'ResaleExpert Team' WHERE author IS NULL OR author = '' OR author = 'Admin'",
  );
}

async function ensureCmsContent() {
  const [tables] = await db.execute(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'cms_content'`,
  );

  if (tables.length === 0) return;

  for (const [key, value] of Object.entries(defaultCmsContent)) {
    const [existing] = await db.execute(
      'SELECT id, content FROM cms_content WHERE content_key = ? LIMIT 1',
      [key],
    );

    if (existing.length === 0) {
      console.log(`Creating CMS content: ${key}`);
      await db.execute(
        'INSERT INTO cms_content (content_key, title, content) VALUES (?, ?, ?)',
        [key, value.title, JSON.stringify(value.content)],
      );
    } else {
      const current = typeof existing[0].content === 'string'
        ? JSON.parse(existing[0].content || '{}')
        : existing[0].content || {};
      const merged = { ...value.content, ...current };
      await db.execute(
        'UPDATE cms_content SET content = ? WHERE content_key = ?',
        [JSON.stringify(merged), key],
      );
    }
  }
}

if (require.main === module) {
  init()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = init;
