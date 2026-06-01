const db = require('../config/db');

const normalizeMetadata = (metadata) => {
  if (!metadata) return null;
  if (typeof metadata === 'string') return metadata;
  return JSON.stringify(metadata);
};

exports.create = async (data) => {
  const [result] = await db.execute(
    `INSERT INTO payment_transactions
      (provider, provider_order_id, provider_payment_link_id, payment_url, plan, label, billing_cycle,
       property_code, customer_name, customer_email, customer_phone, amount, currency,
       status, source, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.provider || 'razorpay',
      data.provider_order_id || null,
      data.provider_payment_link_id || null,
      data.payment_url || null,
      data.plan || 'unknown',
      data.label || null,
      data.billing_cycle || null,
      data.property_code || null,
      data.customer_name || null,
      data.customer_email || null,
      data.customer_phone || null,
      Number(data.amount || 0),
      data.currency || 'INR',
      data.status || 'created',
      data.source || 'client',
      normalizeMetadata(data.metadata),
    ],
  );

  return {
    id: result.insertId,
    ...data,
  };
};

exports.findAll = async (limit = 200) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 200, 1), 500);
  const [rows] = await db.execute(
    `SELECT *
     FROM payment_transactions
     ORDER BY created_at DESC
     LIMIT ${safeLimit}`,
  );
  return rows;
};
