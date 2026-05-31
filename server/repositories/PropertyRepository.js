const BaseRepository = require('./BaseRepository');
const Property = require('../models/Property');
const { parseJsonField } = require('../models/dbHelpers');

const parseNearbyPlaces = (value) => {
  const places = parseJsonField(value, []);
  if (!Array.isArray(places)) return [];

  return places
    .map((place, index) => {
      if (typeof place === 'string') {
        return { name: place, distance: '', unit: 'km', type: '', sort_order: index };
      }
      if (!place || typeof place !== 'object') return null;
      const name = String(place.name || place.placeName || place.title || '').trim();
      if (!name) return null;
      return {
        name,
        distance: String(place.distance || '').trim(),
        unit: String(place.unit || 'km').trim(),
        type: String(place.type || place.category || '').trim(),
        sort_order: Number.isFinite(Number(place.sort_order)) ? Number(place.sort_order) : index,
      };
    })
    .filter(Boolean);
};

class PropertyRepository extends BaseRepository {
  constructor() {
    super(Property.table);
  }

  normalize(row, nearbyPlaces) {
    const property = Property.normalize(row);
    if (!property) return null;
    if (nearbyPlaces !== undefined) {
      property.nearby_places = nearbyPlaces;
      property.nearbyPlaces = nearbyPlaces;
    }
    return property;
  }

  async getNearbyPlacesMap(propertyIds) {
    if (!propertyIds.length) return new Map();
    const placeholders = propertyIds.map(() => '?').join(', ');
    const [rows] = await this.db.execute(
      `SELECT property_id, name, distance, unit, type
       FROM property_nearby_places
       WHERE property_id IN (${placeholders})
       ORDER BY property_id ASC, sort_order ASC, id ASC`,
      propertyIds,
    );

    return rows.reduce((map, row) => {
      const item = {
        name: row.name,
        distance: row.distance || '',
        unit: row.unit || 'km',
        type: row.type || '',
      };
      if (!map.has(row.property_id)) map.set(row.property_id, []);
      map.get(row.property_id).push(item);
      return map;
    }, new Map());
  }

  async getNearbyPlaces(propertyId) {
    const map = await this.getNearbyPlacesMap([propertyId]);
    return map.get(propertyId) || [];
  }

  async replaceNearbyPlaces(propertyId, places) {
    await this.db.execute('DELETE FROM property_nearby_places WHERE property_id = ?', [propertyId]);
    const normalized = parseNearbyPlaces(places);
    for (const [index, place] of normalized.entries()) {
      await this.db.execute(
        `INSERT INTO property_nearby_places
          (property_id, name, distance, unit, type, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          propertyId,
          place.name,
          place.distance || null,
          place.unit || 'km',
          place.type || null,
          index,
        ],
      );
    }
  }

  async resolveDbId(id) {
    const numericId = Number(id);
    const isNumericId = Number.isInteger(numericId) && String(id).trim() === String(numericId);
    if (isNumericId) return numericId;

    const [rows] = await this.db.execute(
      'SELECT id FROM properties WHERE property_code = ? LIMIT 1',
      [id],
    );
    return rows[0]?.id || null;
  }

  async findAll() {
    const rows = await super.findAll('created_at DESC');
    const nearbyMap = await this.getNearbyPlacesMap(rows.map(row => row.id));
    return rows.map(row => this.normalize(
      row,
      nearbyMap.has(row.id) ? nearbyMap.get(row.id) : parseNearbyPlaces(row.nearby_places),
    ));
  }

  async findById(id) {
    const numericId = Number(id);
    const isNumericId = Number.isInteger(numericId) && String(id).trim() === String(numericId);
    const [rows] = isNumericId
      ? await this.db.execute(
        'SELECT * FROM properties WHERE id = ? LIMIT 1',
        [numericId]
      )
      : await this.db.execute(
        'SELECT * FROM properties WHERE property_code = ? LIMIT 1',
        [id]
      );
    if (!rows[0]) return null;
    const nearbyPlaces = await this.getNearbyPlaces(rows[0].id);
    return this.normalize(
      rows[0],
      nearbyPlaces.length ? nearbyPlaces : parseNearbyPlaces(rows[0].nearby_places),
    );
  }

  async create(data) {
    const record = Property.toRecord(data);
    const nearbyPlaces = record.nearby_places;
    record.nearby_places = '[]';
    const result = await super.create(record);
    if (!data.propertyCode && !data.property_code && result.insertId) {
      await super.update(result.insertId, {
        property_code: `REX${String(result.insertId).padStart(4, '0')}`,
      });
    }
    if (result.insertId) {
      await this.replaceNearbyPlaces(result.insertId, nearbyPlaces);
    }
    return result;
  }

  async update(id, data) {
    const updates = Property.toUpdates(data);
    const nearbyPlaces = updates.nearby_places;
    const dbId = await this.resolveDbId(id);
    if (!dbId) return { affectedRows: 0 };
    if (nearbyPlaces !== undefined) updates.nearby_places = '[]';
    const result = await super.update(dbId, updates);
    if (
      data.nearbyPlaces !== undefined ||
      data.nearby_places !== undefined ||
      data.nearby !== undefined ||
      data.places !== undefined
    ) {
      await this.replaceNearbyPlaces(dbId, nearbyPlaces || []);
    }
    return result;
  }

  async incrementViews(id) {
    const numericId = Number(id);
    const isNumericId = Number.isInteger(numericId) && String(id).trim() === String(numericId);
    const [result] = isNumericId
      ? await this.db.execute(
        'UPDATE properties SET views = COALESCE(views, 0) + 1 WHERE id = ?',
        [numericId]
      )
      : await this.db.execute(
        'UPDATE properties SET views = COALESCE(views, 0) + 1 WHERE property_code = ?',
        [id]
      );
    return result;
  }
}

module.exports = new PropertyRepository();
