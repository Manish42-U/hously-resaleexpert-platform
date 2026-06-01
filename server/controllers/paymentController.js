const axios = require('axios');
const PaymentRepository = require('../repositories/PaymentRepository');

const PLAN_AMOUNTS = {
  '5views': 299,
  '12views': 599,
  unlimited: 1999,
  basic: 9999,
  pro: 19999,
  enterprise: 49999,
};

const getAmount = (body = {}) => {
  const requestedAmount = Number(body.amount);
  if (
    Number.isFinite(requestedAmount) &&
    requestedAmount >= 1 &&
    requestedAmount <= 200000
  ) {
    return Math.round(requestedAmount);
  }

  return PLAN_AMOUNTS[body.plan] || PLAN_AMOUNTS['5views'];
};

exports.createRazorpayOrder = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(503).json({
        success: false,
        message: 'Razorpay is not configured on the server',
      });
    }

    const plan = String(req.body.plan || '5views');
    const amount = getAmount(req.body);
    const receipt = String(
      req.body.receipt || `rex_${req.body.propertyCode || 'property'}_${Date.now()}`,
    ).slice(0, 40);

    const response = await axios.post(
      'https://api.razorpay.com/v1/orders',
      {
        amount: amount * 100,
        currency: 'INR',
        receipt,
        notes: {
          property_code: req.body.propertyCode || '',
          plan,
          label: req.body.label || '',
        },
      },
      {
        auth: {
          username: keyId,
          password: keySecret,
        },
      },
    );

    const savedPayment = await PaymentRepository.create({
      provider: 'razorpay',
      provider_order_id: response.data.id,
      plan,
      label: req.body.label || `${plan} plan`,
      property_code: req.body.propertyCode || '',
      amount,
      currency: 'INR',
      status: response.data.status || 'created',
      source: req.body.source || 'checkout',
      metadata: {
        receipt,
        razorpay: response.data,
      },
    }).catch((error) => {
      console.error('payment history save error:', error.message);
      return null;
    });

    return res.status(201).json({
      success: true,
      data: {
        keyId,
        order: response.data,
        plan,
        amount,
        historyId: savedPayment?.id,
      },
    });
  } catch (error) {
    console.error('razorpay order error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Could not create Razorpay order',
    });
  }
};

exports.createRazorpayPaymentLink = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(503).json({
        success: false,
        message: 'Razorpay is not configured on the server',
      });
    }

    const plan = String(req.body.plan || '5views');
    const amount = getAmount(req.body);
    const propertyCode = String(req.body.propertyCode || 'property');
    const customer = {};
    if (req.body.name) customer.name = req.body.name;
    if (req.body.email) customer.email = req.body.email;
    const cleanPhone = String(req.body.phone || '').replace(/\D/g, '');
    if (cleanPhone) customer.contact = cleanPhone;

    const response = await axios.post(
      'https://api.razorpay.com/v1/payment_links',
      {
        amount: amount * 100,
        currency: 'INR',
        accept_partial: false,
        description: req.body.label || `ResaleExpert ${plan} premium access for ${propertyCode}`,
        reference_id: `rex_${propertyCode}_${Date.now()}`.slice(0, 40),
        ...(Object.keys(customer).length ? { customer } : {}),
        notify: {
          sms: false,
          email: false,
        },
        notes: {
          property_code: propertyCode,
          plan,
          label: req.body.label || '',
        },
      },
      {
        auth: {
          username: keyId,
          password: keySecret,
        },
      },
    );

    const savedPayment = await PaymentRepository.create({
      provider: 'razorpay',
      provider_payment_link_id: response.data.id,
      payment_url: response.data.short_url,
      plan,
      label: req.body.label || `ResaleExpert ${plan}`,
      property_code: propertyCode,
      customer_name: req.body.name || null,
      customer_email: req.body.email || null,
      customer_phone: cleanPhone || null,
      amount,
      currency: 'INR',
      status: response.data.status || 'created',
      source: req.body.source || 'payment-link',
      metadata: {
        reference_id: response.data.reference_id,
        razorpay: response.data,
      },
    }).catch((error) => {
      console.error('payment history save error:', error.message);
      return null;
    });

    return res.status(201).json({
      success: true,
      data: {
        paymentLink: response.data,
        url: response.data.short_url,
        plan,
        amount,
        historyId: savedPayment?.id,
      },
    });
  } catch (error) {
    console.error('razorpay payment link error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Could not create Razorpay payment link',
    });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await PaymentRepository.findAll(req.query.limit);
    return res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('payment history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not load payment history',
    });
  }
};
