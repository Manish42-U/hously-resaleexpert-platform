const db = require('../config/db');

const SETTINGS_KEY = 'platform';

const defaultSettings = {
  companyName: 'Hously Finntech Realty',
  supportEmail: 'support@hously.com',
  supportPhone: '+91 98765 43210',
  timezone: 'Asia/Kolkata',
  maintenanceMode: false,
  maintenanceMessage: 'We are upgrading Hously. Please check back shortly.',
  allowRegistration: true,
  autoAssignLeads: true,
  publishApprovalRequired: true,
  whatsappEnabled: true,
  emailNotifications: true,
  weeklyReports: true,
  sessionTimeoutMinutes: 45,
  backupRetentionDays: 30,
  defaultMetaDescription: 'Hously Finntech Realty - Premium real estate listings and property management.',
  cmsItemsPerPage: 20,
  imageQuality: 'high',
  mediaStorageLimitGb: 2,
  mediaStorageUsedGb: 0,
  robotsPolicy: 'Allow all crawlers. Disallow /admin.',
  updatedBy: 'System',
};

const normalizeSettings = (settings = {}) => ({
  ...defaultSettings,
  ...settings,
  maintenanceMode: Boolean(settings.maintenanceMode),
  allowRegistration: settings.allowRegistration !== false,
  autoAssignLeads: settings.autoAssignLeads !== false,
  publishApprovalRequired: settings.publishApprovalRequired !== false,
  whatsappEnabled: settings.whatsappEnabled !== false,
  emailNotifications: settings.emailNotifications !== false,
  weeklyReports: settings.weeklyReports !== false,
  sessionTimeoutMinutes: Number(settings.sessionTimeoutMinutes || defaultSettings.sessionTimeoutMinutes),
  backupRetentionDays: Number(settings.backupRetentionDays || defaultSettings.backupRetentionDays),
  cmsItemsPerPage: Number(settings.cmsItemsPerPage || defaultSettings.cmsItemsPerPage),
  mediaStorageLimitGb: Number(settings.mediaStorageLimitGb || defaultSettings.mediaStorageLimitGb),
  mediaStorageUsedGb: Number(settings.mediaStorageUsedGb || defaultSettings.mediaStorageUsedGb),
  imageQuality: settings.imageQuality || defaultSettings.imageQuality,
  defaultMetaDescription: settings.defaultMetaDescription || defaultSettings.defaultMetaDescription,
  robotsPolicy: settings.robotsPolicy || defaultSettings.robotsPolicy,
});

const getPublicStatus = async () => {
  const settings = await getSettings();
  return {
    maintenanceMode: Boolean(settings.maintenanceMode),
    maintenanceMessage: settings.maintenanceMessage || defaultSettings.maintenanceMessage,
    companyName: settings.companyName || defaultSettings.companyName,
    supportEmail: settings.supportEmail || defaultSettings.supportEmail,
    supportPhone: settings.supportPhone || defaultSettings.supportPhone,
  };
};

const parseValue = (value) => {
  if (!value) return {};
  if (typeof value === 'string') return JSON.parse(value);
  return value;
};

const getSettings = async () => {
  const [rows] = await db.execute(
    'SELECT setting_value, updated_at FROM app_settings WHERE setting_key = ? LIMIT 1',
    [SETTINGS_KEY],
  );

  if (!rows.length) {
    await saveSettings(defaultSettings);
    return { ...defaultSettings, updated_at: new Date().toISOString() };
  }

  return {
    ...normalizeSettings(parseValue(rows[0].setting_value)),
    updated_at: rows[0].updated_at,
  };
};

const saveSettings = async (settings) => {
  const normalized = normalizeSettings(settings);
  await db.execute(
    `INSERT INTO app_settings (setting_key, setting_value)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [SETTINGS_KEY, JSON.stringify(normalized)],
  );
  return getSettings();
};

const updateSettings = async (patch) => {
  const current = await getSettings();
  return saveSettings({ ...current, ...patch });
};

const isMaintenanceMode = async () => {
  const settings = await getSettings();
  return Boolean(settings.maintenanceMode);
};

module.exports = {
  defaultSettings,
  getSettings,
  getPublicStatus,
  saveSettings,
  updateSettings,
  isMaintenanceMode,
};
