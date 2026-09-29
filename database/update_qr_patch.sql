-- ===============================================================
-- WDACFWRS - Online Payment & QR Code Safe Database Migration Patch
-- Run this script on an EXISTING database without deleting any data.
-- ===============================================================

USE wdacfwrs_db;

-- 1. Add owner and payment QR fields to dormitories
ALTER TABLE dormitories 
  ADD COLUMN IF NOT EXISTS owner_name VARCHAR(150) DEFAULT '',
  ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(50) DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_qr VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_account_name VARCHAR(150) DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_account_number VARCHAR(100) DEFAULT '';

-- 2. Add payment QR fields to cottages
ALTER TABLE cottages 
  ADD COLUMN IF NOT EXISTS payment_qr VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_account_name VARCHAR(150) DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_account_number VARCHAR(100) DEFAULT '';

-- 3. Add payment reference number to reservations
ALTER TABLE reservations 
  ADD COLUMN IF NOT EXISTS reference_number VARCHAR(100) DEFAULT '';

-- 4. Add payment reference number to payments
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS reference_number VARCHAR(100) DEFAULT '';
