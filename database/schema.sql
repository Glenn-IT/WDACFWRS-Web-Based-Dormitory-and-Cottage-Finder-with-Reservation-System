-- WDACFWRS database schema
-- CSU-Piat Dormitory & Cottage Finder with Reservation System

CREATE DATABASE IF NOT EXISTS wdacfwrs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wdacfwrs_db;

-- ---------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  security_question VARCHAR(255) NOT NULL,
  security_answer_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Administrator',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Students
-- ---------------------------------------------------------------
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_no VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  security_question VARCHAR(255) NOT NULL,
  security_answer_hash VARCHAR(255) NOT NULL,
  course VARCHAR(150) DEFAULT '',
  year_level VARCHAR(50) DEFAULT '',
  semester VARCHAR(50) DEFAULT '',
  nationality VARCHAR(100) DEFAULT 'Filipino',
  address VARCHAR(255) DEFAULT '',
  birthday DATE NULL,
  phone VARCHAR(30) DEFAULT '',
  profile_pic_path VARCHAR(255) DEFAULT NULL,
  status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  date_registered DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Dormitories
-- ---------------------------------------------------------------
CREATE TABLE dormitories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_no VARCHAR(30) NOT NULL UNIQUE,
  gender ENUM('Male','Female') NOT NULL,
  capacity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('Available','Occupied','Full') NOT NULL DEFAULT 'Available',
  description TEXT,
  image_path VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Cottages
-- ---------------------------------------------------------------
CREATE TABLE cottages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  owner VARCHAR(150) DEFAULT '',
  rooms INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  availability ENUM('Available','Booked') NOT NULL DEFAULT 'Available',
  description TEXT,
  image_path VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Reservations
-- ---------------------------------------------------------------
CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  type ENUM('Dormitory','Cottage') NOT NULL,
  dorm_id INT NULL,
  cottage_id INT NULL,
  payment_method VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  reservation_date DATE NOT NULL,
  payment_status ENUM('Pending','Paid') NOT NULL DEFAULT 'Pending',
  approval_status ENUM('Pending','Approved','Declined','Cancelled') NOT NULL DEFAULT 'Pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_res_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_res_dorm FOREIGN KEY (dorm_id) REFERENCES dormitories(id) ON DELETE SET NULL,
  CONSTRAINT fk_res_cottage FOREIGN KEY (cottage_id) REFERENCES cottages(id) ON DELETE SET NULL,
  CONSTRAINT chk_res_asset CHECK (
    (type = 'Dormitory' AND dorm_id IS NOT NULL AND cottage_id IS NULL) OR
    (type = 'Cottage' AND cottage_id IS NOT NULL AND dorm_id IS NULL)
  )
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Reservation parent/guardian info
-- ---------------------------------------------------------------
CREATE TABLE reservation_parent_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL UNIQUE,
  father_name VARCHAR(150) DEFAULT '',
  mother_name VARCHAR(150) DEFAULT '',
  occupation VARCHAR(150) DEFAULT '',
  education VARCHAR(150) DEFAULT '',
  address VARCHAR(255) DEFAULT '',
  phone VARCHAR(30) DEFAULT '',
  emergency_contact VARCHAR(150) DEFAULT '',
  relationship VARCHAR(100) DEFAULT '',
  emergency_number VARCHAR(30) DEFAULT '',
  CONSTRAINT fk_parent_res FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Reservation student background
-- ---------------------------------------------------------------
CREATE TABLE reservation_backgrounds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL UNIQUE,
  appliances VARCHAR(255) DEFAULT '',
  friends_at_dorm VARCHAR(10) DEFAULT '',
  friends_relationship VARCHAR(100) DEFAULT '',
  reason VARCHAR(255) DEFAULT '',
  medical_conditions VARCHAR(255) DEFAULT '',
  severe_illness VARCHAR(255) DEFAULT '',
  hobbies VARCHAR(255) DEFAULT '',
  smoking VARCHAR(10) DEFAULT '',
  drinking VARCHAR(20) DEFAULT '',
  organizations VARCHAR(255) DEFAULT '',
  leisure VARCHAR(255) DEFAULT '',
  CONSTRAINT fk_bg_res FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  method VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('Pending','Paid') NOT NULL DEFAULT 'Pending',
  date DATE NOT NULL,
  CONSTRAINT fk_pay_res FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  message VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_notif_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Seed: single real admin account
--   email:            admin@csupiat.edu.ph
--   password:         Admin@123
--   security question: What is your mother's maiden name?
--   security answer:   reyes (case-insensitive, stored lowercased+hashed)
-- CHANGE THE PASSWORD AFTER FIRST LOGIN (Settings > Password tab).
-- ---------------------------------------------------------------
INSERT INTO admins (name, email, password_hash, security_question, security_answer_hash, role) VALUES (
  'System Administrator',
  'admin@csupiat.edu.ph',
  '$2y$10$GRep99mI/zmnGCAjnM4DKuMiQxaGkMSi3M3EtPIGVmomLtHHicKWi',
  'What is your mother''s maiden name?',
  '$2y$10$J9h4FPfbZxcCEwwwoOD4/.ICVhyHkoK0zXK6izllS3W85b713jiXC',
  'Administrator'
);
