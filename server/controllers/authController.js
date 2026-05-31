const crypto = require('crypto');
const UserRepository = require('../repositories/UserRepository');
const AppSettingsService = require('../services/AppSettingsService');

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
};

const verifyPassword = (password, storedPassword) => {
  if (!storedPassword) return false;

  const [scheme, salt, hash] = storedPassword.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) {
    return password === storedPassword;
  }

  const candidate = hashPassword(password, salt);
  if (candidate.length !== storedPassword.length) return false;
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(storedPassword));
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
});

const normalizeRole = (role) => (
  ['admin', 'manager', 'agent', 'user'].includes(role) ? role : 'user'
);

exports.register = async (req, res) => {
  try {
    const settings = await AppSettingsService.getSettings();
    if (!settings.allowRegistration) {
      return res.status(403).json({
        success: false,
        message: 'Public registration is currently disabled.',
      });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const safeRole = normalizeRole(role);
    const result = await UserRepository.create({
      name,
      email: String(email).toLowerCase(),
      password: hashPassword(password),
      role: safeRole,
    });

    return res.status(201).json({
      success: true,
      message: `${safeRole === 'admin' ? 'Admin' : safeRole === 'manager' ? 'Manager' : safeRole === 'agent' ? 'Agent' : 'User'} registered successfully`,
      user: { id: result.insertId, name, email: String(email).toLowerCase(), role: safeRole },
    });
  } catch (error) {
    console.error('register error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await UserRepository.findByEmail(String(email).toLowerCase());
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      token: crypto.randomBytes(24).toString('hex'),
      user: publicUser(user),
    });
  } catch (error) {
    console.error('login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};
