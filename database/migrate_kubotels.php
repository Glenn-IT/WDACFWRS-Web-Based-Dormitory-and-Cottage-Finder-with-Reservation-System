<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';

$pdo = get_db();

echo "1. Creating kubotels table...\n";
$pdo->exec("CREATE TABLE IF NOT EXISTS kubotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  owner VARCHAR(150) DEFAULT '',
  owner_photo VARCHAR(255) DEFAULT NULL,
  owner_phone VARCHAR(50) DEFAULT '',
  owner_email VARCHAR(100) DEFAULT '',
  owner_bio TEXT DEFAULT NULL,
  rooms INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  availability ENUM('Available','Booked') NOT NULL DEFAULT 'Available',
  description TEXT,
  image_path VARCHAR(255) DEFAULT NULL,
  payment_qr VARCHAR(255) DEFAULT NULL,
  payment_account_name VARCHAR(150) DEFAULT '',
  payment_account_number VARCHAR(100) DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

echo "2. Checking reservations table...\n";
$cols = $pdo->query("SHOW COLUMNS FROM reservations LIKE 'kubotel_id'")->fetchAll();
if (empty($cols)) {
    echo "Adding kubotel_id and updating constraints in reservations...\n";
    $pdo->exec("ALTER TABLE reservations MODIFY COLUMN type ENUM('Dormitory','Cottage','Kubotel') NOT NULL;");
    $pdo->exec("ALTER TABLE reservations ADD COLUMN kubotel_id INT NULL AFTER cottage_id;");
    $pdo->exec("ALTER TABLE reservations ADD CONSTRAINT fk_res_kubotel FOREIGN KEY (kubotel_id) REFERENCES kubotels(id) ON DELETE SET NULL;");
    
    // Check if chk_res_asset exists
    try {
        $pdo->exec("ALTER TABLE reservations DROP CONSTRAINT chk_res_asset;");
    } catch (Exception $e) {
        // ignore if not present
    }
    
    $pdo->exec("ALTER TABLE reservations ADD CONSTRAINT chk_res_asset CHECK (
      (type = 'Dormitory' AND dorm_id IS NOT NULL AND cottage_id IS NULL AND kubotel_id IS NULL) OR
      (type = 'Cottage' AND cottage_id IS NOT NULL AND dorm_id IS NULL AND kubotel_id IS NULL) OR
      (type = 'Kubotel' AND kubotel_id IS NOT NULL AND dorm_id IS NULL AND cottage_id IS NULL)
    );");
} else {
    echo "kubotel_id already exists in reservations.\n";
}

// Add sample kubotels if empty
$count = (int)$pdo->query("SELECT COUNT(*) FROM kubotels")->fetchColumn();
if ($count === 0) {
    echo "Seeding initial Kubotel units...\n";
    $stmt = $pdo->prepare("INSERT INTO kubotels (name, owner, owner_phone, owner_email, owner_bio, rooms, price, availability, description, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        'Kubotel Unit 1 - Eco Bamboo Hut',
        'Ronaldo Maggay',
        '09171234567',
        'ronaldo.maggay@gmail.com',
        'Caretaker of CSU-Piat Agro-Tourism Kubotel facilities.',
        1,
        450.00,
        'Available',
        'Traditional Filipino Kubo-Hotel unit equipped with bamboo bed, native ventilation, electric fan, and scenic campus farm views.',
        'assets/uploads/cottages/cottage1.jpg'
    ]);
    $stmt->execute([
        'Kubotel Unit 2 - Riverside Kubo Suite',
        'Elena Soriano',
        '09189876543',
        'elena.soriano@gmail.com',
        'Experienced hospitality caretaker for university guest accommodations.',
        2,
        650.00,
        'Available',
        'Spacious Kubo-Hotel suite featuring dual bamboo beds, private bath, screened windows, and peaceful riverside breeze.',
        'assets/uploads/cottages/cottage2.jpg'
    ]);
    $stmt->execute([
        'Kubotel Unit 3 - Green Garden Kubo',
        'CSU Auxiliary Services',
        '09205551234',
        'auxiliary@csupiat.edu.ph',
        'Official CSU-Piat Housing & Eco-Tourism Auxiliary Services.',
        1,
        400.00,
        'Available',
        'Cozy campus Kubo-Hotel room surrounded by lush agro-forestry gardens. Quiet and breezy native accommodation.',
        'assets/uploads/cottages/cottage3.jpg'
    ]);
}

echo "Database migration finished successfully!\n";
