-- WDACFWRS Sample Data (5 Students + Reservations + Dorms + Cottages)
-- Default Password for all sample students: sample123
-- Security Question: What is your mother's maiden name?
-- Security Answer: sample

USE wdacfwrs_db;

-- --------------------------------------------------------
-- Sample Dormitories
-- --------------------------------------------------------
INSERT INTO dormitories (room_no, gender, capacity, price, status, description, image_path) VALUES
('Sampaguita Hall Room 101', 'Female', 4, 1200.00, 'Occupied', 'Spacious room near the study lounge with air conditioning and individual study desks.', 'assets/uploads/dorms/977f2000225dfa62a12aed0648f35cf9.png'),
('Narra Hall Room 204', 'Male', 2, 1500.00, 'Occupied', 'Quiet 2-person room on the 2nd floor with private bathroom and balcony.', 'assets/uploads/dorms/977f2000225dfa62a12aed0648f35cf9.png'),
('Ipil Hall Room 302', 'Female', 2, 1800.00, 'Occupied', 'Fully furnished room with double deck bed, built-in closets, and Wi-Fi access.', 'assets/uploads/dorms/977f2000225dfa62a12aed0648f35cf9.png'),
('Yakal Hall Room 105', 'Male', 4, 1000.00, 'Available', 'Standard 4-bed dormitory room with study area and shared lounge.', 'assets/uploads/dorms/977f2000225dfa62a12aed0648f35cf9.png')
ON DUPLICATE KEY UPDATE price=VALUES(price);

-- --------------------------------------------------------
-- Sample Cottages
-- --------------------------------------------------------
INSERT INTO cottages (name, owner, rooms, price, availability, description, image_path) VALUES
('Pine Breeze Cottage', 'CSU Auxiliary Services', 2, 2200.00, 'Booked', 'Cozy duplex cottage with kitchen amenities and scenic garden view.', 'assets/uploads/cottages/825354ff82bda1ab6b9dd0b67fd0ef0d.png'),
('Garden View Cottage B', 'Maria Fernandez', 1, 1600.00, 'Booked', 'Single-room peaceful cottage surrounded by lush greenery, ideal for focused study.', 'assets/uploads/cottages/825354ff82bda1ab6b9dd0b67fd0ef0d.png'),
('Sunrise Haven Cottage', 'CSU Housing Office', 3, 3000.00, 'Available', 'Large family-style cottage with 3 bedrooms, living area, and porch.', 'assets/uploads/cottages/825354ff82bda1ab6b9dd0b67fd0ef0d.png');

