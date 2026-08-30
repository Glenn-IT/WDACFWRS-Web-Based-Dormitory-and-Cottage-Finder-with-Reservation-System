<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

$pdo = get_db();

echo "Starting seed process...\n";

// 1. Ensure additional Dormitories and Cottages exist for realistic reservations
$sampleDorms = [
    [
        'room_no' => 'Sampaguita Hall Room 101',
        'gender' => 'Female',
        'capacity' => 4,
        'price' => 1200.00,
        'status' => 'Occupied',
        'description' => 'Spacious room near the study lounge with air conditioning and individual study desks.',
        'image_path' => 'assets/uploads/dorms/977f2000225dfa62a12aed0648f35cf9.png'
    ],
    [
        'room_no' => 'Narra Hall Room 204',
        'gender' => 'Male',
        'capacity' => 2,
        'price' => 1500.00,
        'status' => 'Occupied',
        'description' => 'Quiet 2-person room on the 2nd floor with private bathroom and balcony.',
        'image_path' => 'assets/uploads/dorms/977f2000225dfa62a12aed0648f35cf9.png'
    ],
    [
        'room_no' => 'Ipil Hall Room 302',
        'gender' => 'Female',
        'capacity' => 2,
        'price' => 1800.00,
        'status' => 'Occupied',
        'description' => 'Fully furnished room with double deck bed, built-in closets, and Wi-Fi access.',
        'image_path' => 'assets/uploads/dorms/977f2000225dfa62a12aed0648f35cf9.png'
    ],
    [
        'room_no' => 'Yakal Hall Room 105',
        'gender' => 'Male',
        'capacity' => 4,
        'price' => 1000.00,
        'status' => 'Available',
        'description' => 'Standard 4-bed dormitory room with study area and shared lounge.',
        'image_path' => 'assets/uploads/dorms/977f2000225dfa62a12aed0648f35cf9.png'
    ]
];

foreach ($sampleDorms as $dorm) {
    $stmt = $pdo->prepare('SELECT id FROM dormitories WHERE room_no = ?');
    $stmt->execute([$dorm['room_no']]);
    if (!$stmt->fetch()) {
        $ins = $pdo->prepare('INSERT INTO dormitories (room_no, gender, capacity, price, status, description, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $ins->execute([$dorm['room_no'], $dorm['gender'], $dorm['capacity'], $dorm['price'], $dorm['status'], $dorm['description'], $dorm['image_path']]);
        echo "Added Dormitory: {$dorm['room_no']}\n";
    }
}

$sampleCottages = [
    [
        'name' => 'Pine Breeze Cottage',
        'owner' => 'CSU Auxiliary Services',
        'rooms' => 2,
        'price' => 2200.00,
        'availability' => 'Booked',
        'description' => 'Cozy duplex cottage with kitchen amenities and scenic garden view.',
        'image_path' => 'assets/uploads/cottages/825354ff82bda1ab6b9dd0b67fd0ef0d.png'
    ],
    [
        'name' => 'Garden View Cottage B',
        'owner' => 'Maria Fernandez',
        'rooms' => 1,
        'price' => 1600.00,
        'availability' => 'Booked',
        'description' => 'Single-room peaceful cottage surrounded by lush greenery, ideal for focused study.',
        'image_path' => 'assets/uploads/cottages/825354ff82bda1ab6b9dd0b67fd0ef0d.png'
    ],
    [
        'name' => 'Sunrise Haven Cottage',
        'owner' => 'CSU Housing Office',
        'rooms' => 3,
        'price' => 3000.00,
        'availability' => 'Available',
        'description' => 'Large family-style cottage with 3 bedrooms, living area, and porch.',
        'image_path' => 'assets/uploads/cottages/825354ff82bda1ab6b9dd0b67fd0ef0d.png'
    ]
];

foreach ($sampleCottages as $cottage) {
    $stmt = $pdo->prepare('SELECT id FROM cottages WHERE name = ?');
    $stmt->execute([$cottage['name']]);
    if (!$stmt->fetch()) {
        $ins = $pdo->prepare('INSERT INTO cottages (name, owner, rooms, price, availability, description, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $ins->execute([$cottage['name'], $cottage['owner'], $cottage['rooms'], $cottage['price'], $cottage['availability'], $cottage['description'], $cottage['image_path']]);
        echo "Added Cottage: {$cottage['name']}\n";
    }
}

// 2. Fetch dorm and cottage IDs
$dormMap = [];
foreach ($pdo->query('SELECT id, room_no, price FROM dormitories')->fetchAll() as $d) {
    $dormMap[$d['room_no']] = $d;
}

$cottageMap = [];
foreach ($pdo->query('SELECT id, name, price FROM cottages')->fetchAll() as $c) {
    $cottageMap[$c['name']] = $c;
}

// 3. Define 5 Sample Students with password "sample123"
$defaultPassword = 'sample123';
$passwordHash = password_hash($defaultPassword, PASSWORD_DEFAULT);
$secAnswerHash = password_hash('sample', PASSWORD_DEFAULT);
$secQuestion = "What is your mother's maiden name?";

$studentsData = [
    [
        'first_name' => 'Maria Clara',
        'last_name' => 'De Los Santos',
        'email' => 'maria.delossantos@gmail.com',
        'course' => 'BS Information Technology',
        'year_level' => '2nd Year',
        'semester' => '1st Semester',
        'address' => 'Centro 2, Piat, Cagayan',
        'birthday' => '2004-05-14',
        'phone' => '09171234501',
        'res_type' => 'Dormitory',
        'asset_type' => 'dorm',
        'asset_key' => 'Sampaguita Hall Room 101',
        'payment_method' => 'GCash',
        'payment_status' => 'Paid',
        'approval_status' => 'Approved',
        'parent' => [
            'father_name' => 'Roberto De Los Santos',
            'mother_name' => 'Clara De Los Santos',
            'occupation' => 'Civil Engineer',
            'education' => 'College Graduate',
            'address' => 'Centro 2, Piat, Cagayan',
            'phone' => '09181112233',
            'emergency_contact' => 'Roberto De Los Santos',
            'relationship' => 'Father',
            'emergency_number' => '09181112233'
        ],
        'background' => [
            'appliances' => 'Laptop, Electric Fan, Phone Charger',
            'friends_at_dorm' => 'Yes',
            'friends_relationship' => 'High School Classmate',
            'reason' => 'Closer to campus to reduce daily commute time.',
            'medical_conditions' => 'None',
            'severe_illness' => 'None',
            'hobbies' => 'Reading, Coding, Playing Guitar',
            'smoking' => 'No',
            'drinking' => 'No',
            'organizations' => 'CSU IT Society',
            'leisure' => 'Badminton and Board games'
        ]
    ],
    [
        'first_name' => 'Angelo',
        'last_name' => 'Bautista',
        'email' => 'angelo.bautista@gmail.com',
        'course' => 'BS Agriculture',
        'year_level' => '3rd Year',
        'semester' => '1st Semester',
        'address' => 'Maguilling, Piat, Cagayan',
        'birthday' => '2003-11-20',
        'phone' => '09171234502',
        'res_type' => 'Dormitory',
        'asset_type' => 'dorm',
        'asset_key' => 'Narra Hall Room 204',
        'payment_method' => 'Cash',
        'payment_status' => 'Paid',
        'approval_status' => 'Approved',
        'parent' => [
            'father_name' => 'Danilo Bautista',
            'mother_name' => 'Elena Bautista',
            'occupation' => 'Farmer / Business Owner',
            'education' => 'High School Graduate',
            'address' => 'Maguilling, Piat, Cagayan',
            'phone' => '09192223344',
            'emergency_contact' => 'Elena Bautista',
            'relationship' => 'Mother',
            'emergency_number' => '09192223344'
        ],
        'background' => [
            'appliances' => 'Electric Fan, Desk Lamp',
            'friends_at_dorm' => 'No',
            'friends_relationship' => 'None',
            'reason' => 'Early morning field research and laboratory access.',
            'medical_conditions' => 'Mild Asthma',
            'severe_illness' => 'None',
            'hobbies' => 'Basketball, Gardening',
            'smoking' => 'No',
            'drinking' => 'Occasional',
            'organizations' => 'Junior Agriculturists Association',
            'leisure' => 'Watching sports and jogging'
        ]
    ],
    [
        'first_name' => 'Beatriz',
        'last_name' => 'Mendoza',
        'email' => 'beatriz.mendoza@gmail.com',
        'course' => 'BS Hospitality Management',
        'year_level' => '1st Year',
        'semester' => '1st Semester',
        'address' => 'Sto. Domingo, Piat, Cagayan',
        'birthday' => '2005-03-08',
        'phone' => '09171234503',
        'res_type' => 'Cottage',
        'asset_type' => 'cottage',
        'asset_key' => 'Pine Breeze Cottage',
        'payment_method' => 'Maya',
        'payment_status' => 'Paid',
        'approval_status' => 'Approved',
        'parent' => [
            'father_name' => 'Eduardo Mendoza',
            'mother_name' => 'Corazon Mendoza',
            'occupation' => 'Teacher',
            'education' => 'Master\'s Degree',
            'address' => 'Sto. Domingo, Piat, Cagayan',
            'phone' => '09203334455',
            'emergency_contact' => 'Corazon Mendoza',
            'relationship' => 'Mother',
            'emergency_number' => '09203334455'
        ],
        'background' => [
            'appliances' => 'Laptop, Rice Cooker, Hair Dryer',
            'friends_at_dorm' => 'Yes',
            'friends_relationship' => 'Cousin',
            'reason' => 'Prefers cottage environment with kitchen for culinary practice.',
            'medical_conditions' => 'None',
            'severe_illness' => 'None',
            'hobbies' => 'Baking, Photography',
            'smoking' => 'No',
            'drinking' => 'No',
            'organizations' => 'Hospitality Leaders Guild',
            'leisure' => 'Cooking and Watercolor painting'
        ]
    ],
    [
        'first_name' => 'Christian',
        'last_name' => 'Navarro',
        'email' => 'christian.navarro@gmail.com',
        'course' => 'BS Criminology',
        'year_level' => '4th Year',
        'semester' => '1st Semester',
        'address' => 'Baung, Piat, Cagayan',
        'birthday' => '2002-09-17',
        'phone' => '09171234504',
        'res_type' => 'Dormitory',
        'asset_type' => 'dorm',
        'asset_key' => 'Ipil Hall Room 302',
        'payment_method' => 'Cash',
        'payment_status' => 'Pending',
        'approval_status' => 'Pending',
        'parent' => [
            'father_name' => 'Nestor Navarro',
            'mother_name' => 'Lorna Navarro',
            'occupation' => 'Police Officer',
            'education' => 'College Graduate',
            'address' => 'Baung, Piat, Cagayan',
            'phone' => '09214445566',
            'emergency_contact' => 'Nestor Navarro',
            'relationship' => 'Father',
            'emergency_number' => '09214445566'
        ],
        'background' => [
            'appliances' => 'Iron, Electric Fan, Laptop',
            'friends_at_dorm' => 'Yes',
            'friends_relationship' => 'Squadmate',
            'reason' => 'Convenient stay for internship and board exam review sessions.',
            'medical_conditions' => 'None',
            'severe_illness' => 'None',
            'hobbies' => 'Running, Martial Arts',
            'smoking' => 'No',
            'drinking' => 'No',
            'organizations' => 'Crim Student Council',
            'leisure' => 'Weightlifting and Cycling'
        ]
    ],
    [
        'first_name' => 'Diana Rose',
        'last_name' => 'Villanueva',
        'email' => 'diana.villanueva@gmail.com',
        'course' => 'Bachelor of Elementary Education',
        'year_level' => '2nd Year',
        'semester' => '1st Semester',
        'address' => 'Poblacion, Piat, Cagayan',
        'birthday' => '2004-12-02',
        'phone' => '09171234505',
        'res_type' => 'Cottage',
        'asset_type' => 'cottage',
        'asset_key' => 'Garden View Cottage B',
        'payment_method' => 'GCash',
        'payment_status' => 'Paid',
        'approval_status' => 'Approved',
        'parent' => [
            'father_name' => 'Arman Villanueva',
            'mother_name' => 'Teresa Villanueva',
            'occupation' => 'Accountant',
            'education' => 'College Graduate',
            'address' => 'Poblacion, Piat, Cagayan',
            'phone' => '09225556677',
            'emergency_contact' => 'Teresa Villanueva',
            'relationship' => 'Mother',
            'emergency_number' => '09225556677'
        ],
        'background' => [
            'appliances' => 'Laptop, Printer, Electric Fan',
            'friends_at_dorm' => 'No',
            'friends_relationship' => 'None',
            'reason' => 'Quiet place for lesson planning and preparation of instructional materials.',
            'medical_conditions' => 'None',
            'severe_illness' => 'None',
            'hobbies' => 'Crafting, Storytelling, Singing',
            'smoking' => 'No',
            'drinking' => 'No',
            'organizations' => 'Future Educators Association',
            'leisure' => 'Reading educational books and music'
        ]
    ]
];

function get_next_student_no(PDO $pdo): string {
    $stmt = $pdo->query("SELECT student_no FROM students ORDER BY id DESC LIMIT 1");
    $last = $stmt->fetchColumn();
    $n = 1;
    if ($last && preg_match('/(\d+)$/', (string)$last, $m)) {
        $n = (int)$m[1] + 1;
    }
    return 'STU-' . str_pad((string)$n, 4, '0', STR_PAD_LEFT);
}

foreach ($studentsData as $idx => $s) {
    // Check if student already exists by email
    $stmt = $pdo->prepare('SELECT id FROM students WHERE email = ?');
    $stmt->execute([$s['email']]);
    $existing = $stmt->fetch();

    if ($existing) {
        $studentId = (int)$existing['id'];
        echo "Student {$s['email']} already exists (ID: $studentId).\n";
    } else {
        $studentNo = get_next_student_no($pdo);
        $stmt = $pdo->prepare('INSERT INTO students 
            (student_no, first_name, last_name, email, password_hash, security_question, security_answer_hash, course, year_level, semester, nationality, address, birthday, phone, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'Active\')');
        $stmt->execute([
            $studentNo,
            $s['first_name'],
            $s['last_name'],
            $s['email'],
            $passwordHash,
            $secQuestion,
            $secAnswerHash,
            $s['course'],
            $s['year_level'],
            $s['semester'],
            'Filipino',
            $s['address'],
            $s['birthday'],
            $s['phone']
        ]);
        $studentId = (int)$pdo->lastInsertId();
        echo "Created Student: {$s['first_name']} {$s['last_name']} ({$s['email']}) -> Student No: $studentNo, ID: $studentId\n";
    }

    // Determine asset ID and amount
    $dormId = null;
    $cottageId = null;
    $amount = 0.00;

    if ($s['res_type'] === 'Dormitory') {
        $dorm = $dormMap[$s['asset_key']] ?? null;
        if (!$dorm) {
            $dorm = reset($dormMap);
        }
        $dormId = (int)$dorm['id'];
        $amount = (float)$dorm['price'];
    } else {
        $cottage = $cottageMap[$s['asset_key']] ?? null;
        if (!$cottage) {
            $cottage = reset($cottageMap);
        }
        $cottageId = (int)$cottage['id'];
        $amount = (float)$cottage['price'];
    }

    // Check if a reservation already exists for this student
    $stmt = $pdo->prepare('SELECT id FROM reservations WHERE student_id = ?');
    $stmt->execute([$studentId]);
    $existingRes = $stmt->fetch();

    if ($existingRes) {
        echo "Reservation already exists for student ID $studentId.\n";
        continue;
    }

    $today = date('Y-m-d');
    $stmt = $pdo->prepare('INSERT INTO reservations 
        (student_id, type, dorm_id, cottage_id, payment_method, amount, reservation_date, payment_status, approval_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $studentId,
        $s['res_type'],
        $dormId,
        $cottageId,
        $s['payment_method'],
        $amount,
        $today,
        $s['payment_status'],
        $s['approval_status']
    ]);
    $resId = (int)$pdo->lastInsertId();

    // Insert Parent Info
    $stmt = $pdo->prepare('INSERT INTO reservation_parent_info 
        (reservation_id, father_name, mother_name, occupation, education, address, phone, emergency_contact, relationship, emergency_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $resId,
        $s['parent']['father_name'],
        $s['parent']['mother_name'],
        $s['parent']['occupation'],
        $s['parent']['education'],
        $s['parent']['address'],
        $s['parent']['phone'],
        $s['parent']['emergency_contact'],
        $s['parent']['relationship'],
        $s['parent']['emergency_number']
    ]);

    // Insert Background
    $stmt = $pdo->prepare('INSERT INTO reservation_backgrounds 
        (reservation_id, appliances, friends_at_dorm, friends_relationship, reason, medical_conditions, severe_illness, hobbies, smoking, drinking, organizations, leisure)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $resId,
        $s['background']['appliances'],
        $s['background']['friends_at_dorm'],
        $s['background']['friends_relationship'],
        $s['background']['reason'],
        $s['background']['medical_conditions'],
        $s['background']['severe_illness'],
        $s['background']['hobbies'],
        $s['background']['smoking'],
        $s['background']['drinking'],
        $s['background']['organizations'],
        $s['background']['leisure']
    ]);

    // Insert Payment
    $stmt = $pdo->prepare('INSERT INTO payments (reservation_id, method, amount, status, date) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$resId, $s['payment_method'], $amount, $s['payment_status'], $today]);

    // Insert Notification
    $msg = $s['approval_status'] === 'Approved'
        ? "Your reservation #$resId has been approved! Welcome to CSU-Piat."
        : "Your reservation #$resId has been submitted and is pending approval.";
    $stmt = $pdo->prepare('INSERT INTO notifications (student_id, message) VALUES (?, ?)');
    $stmt->execute([$studentId, $msg]);

    echo "Created Reservation #$resId for {$s['first_name']} {$s['last_name']} ({$s['res_type']} - {$s['approval_status']}).\n";
}

echo "Seeding completed successfully!\n";
