-- Database schema for Hously Finntech Realty

CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_code VARCHAR(50) UNIQUE,
  title VARCHAR(255) NOT NULL,
  property_type VARCHAR(100) DEFAULT 'Residential',
  unit_type VARCHAR(100),
  subtype VARCHAR(100),
  city VARCHAR(100) DEFAULT 'Pune',
  location VARCHAR(255),
  price DECIMAL(15, 2) DEFAULT 0,
  carpet_area DECIMAL(12, 2) DEFAULT 0,
  per_sq_ft DECIMAL(12, 2) DEFAULT 0,
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  parking INT DEFAULT 0,
  parking_type VARCHAR(100),
  floor VARCHAR(100),
  total_floors VARCHAR(100),
  furnishing VARCHAR(100),
  built_year VARCHAR(20),
  balcony INT DEFAULT 0,
  facing VARCHAR(100),
  negotiable BOOLEAN DEFAULT FALSE,
  status VARCHAR(100) DEFAULT 'Available',
  possession_date VARCHAR(50),
  description LONGTEXT,
  image_url VARCHAR(700),
  images JSON,
  amenities JSON,
  furnishing_items JSON,
  featured BOOLEAN DEFAULT FALSE,
  ai_score INT DEFAULT 0,
  rating DECIMAL(3, 1) DEFAULT 0,
  views INT DEFAULT 0,
  growth VARCHAR(100),
  investment_grade VARCHAR(100),
  roi_potential VARCHAR(100),
  executive_name VARCHAR(255),
  executive_role VARCHAR(255),
  full_name VARCHAR(255) DEFAULT '',
  email VARCHAR(255) DEFAULT '',
  phone VARCHAR(20) DEFAULT '',
  whatsapp VARCHAR(20),
  owner_details JSON,
  location_details JSON,
  pricing_details JSON,
  timeline_details JSON,
  legal_details JSON,
  nearby_places JSON,
  ownership_document LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS property_nearby_places (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  distance VARCHAR(50),
  unit VARCHAR(20) DEFAULT 'km',
  type VARCHAR(100),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  INDEX idx_property_nearby_places_property_id (property_id)
);

CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content LONGTEXT,
  author VARCHAR(100) NOT NULL,
  read_time VARCHAR(50) DEFAULT '5 min read',
  category VARCHAR(100) DEFAULT 'Real Estate',
  tags JSON,
  image_url VARCHAR(700),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blog_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  comment TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'agent', 'manager', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  property_type VARCHAR(100),
  budget VARCHAR(100),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  assigned_to VARCHAR(100),
  admin_notes TEXT,
  last_contacted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS whatsapp_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100),
  last_message TEXT,
  last_message_at TIMESTAMP NULL,
  unread_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_id INT NOT NULL,
  wa_message_id VARCHAR(255) UNIQUE,
  body TEXT,
  type VARCHAR(50) DEFAULT 'text',
  direction ENUM('incoming', 'outgoing') NOT NULL,
  status VARCHAR(50) DEFAULT 'sent',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES whatsapp_contacts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cms_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content_key VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  content JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(50) DEFAULT 'razorpay',
  provider_order_id VARCHAR(120),
  provider_payment_link_id VARCHAR(120),
  payment_url VARCHAR(700),
  plan VARCHAR(100) NOT NULL,
  label VARCHAR(255),
  property_code VARCHAR(100),
  customer_name VARCHAR(150),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(30),
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'created',
  source VARCHAR(100) DEFAULT 'client',
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_payment_transactions_created_at (created_at),
  INDEX idx_payment_transactions_status (status),
  INDEX idx_payment_transactions_plan (plan),
  INDEX idx_payment_transactions_property_code (property_code)
);
