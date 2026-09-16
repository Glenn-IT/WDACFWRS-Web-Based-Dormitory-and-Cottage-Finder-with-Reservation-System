-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 16, 2026 at 03:35 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `wdacfwrs_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `security_question` varchar(255) NOT NULL,
  `security_answer_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'Administrator',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `password_hash`, `security_question`, `security_answer_hash`, `role`, `created_at`) VALUES
(1, 'System Administrator', 'admin@csupiat.edu.ph', '$2y$10$tYKfSXnoQj3l2rQ3eqCHvusOmjFvAlBaDecFFUJGI6W5agG9pg10a', 'What is your mother\'s maiden name?', '$2y$10$6Jvk/J0/w0bb4uaBP8d0qua97kBvoPrYU2LRz.8d0CmIOghWy4xri', 'Administrator', '2026-07-07 10:20:29');

-- --------------------------------------------------------

--
-- Table structure for table `cottages`
--

CREATE TABLE `cottages` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `owner` varchar(150) DEFAULT '',
  `owner_photo` varchar(255) DEFAULT NULL,
  `owner_phone` varchar(50) DEFAULT '',
  `owner_email` varchar(100) DEFAULT '',
  `owner_bio` text DEFAULT NULL,
  `rooms` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `availability` enum('Available','Booked') NOT NULL DEFAULT 'Available',
  `description` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cottages`
--

INSERT INTO `cottages` (`id`, `name`, `owner`, `owner_photo`, `owner_phone`, `owner_email`, `owner_bio`, `rooms`, `price`, `availability`, `description`, `image_path`, `created_at`) VALUES
(1, 'Kubutel A', 'Anti Claire', NULL, '09289876543', 'anticlaire@gmail.com', 'Friendly host offering cozy, secure cottage units near the main campus.', 1, 599.00, 'Available', 'Sample priiiii', 'assets/uploads/cottages/825354ff82bda1ab6b9dd0b67fd0ef0d.png', '2026-08-07 23:43:47'),
(2, 'Pine Breeze Cottage', 'CSU Auxiliary Services', NULL, '09195551234', 'auxiliary@csupiat.edu.ph', 'Official CSU-Piat Auxiliary and Housing Management Services.', 2, 2200.00, 'Booked', 'Cozy duplex cottage with kitchen amenities and scenic garden view.', 'assets/uploads/cottages/825354ff82bda1ab6b9dd0b67fd0ef0d.png', '2026-08-30 20:25:41'),
(3, 'Garden View Cottage B', 'Maria Fernandez', 'assets/uploads/owners/68ab7c935bef6e1c5973824766f1b72c.png', '09171234567', 'maria.fernandez@gmail.com', 'Campus cottage owner for 5 years. Always available during school hours.', 1, 1600.00, 'Booked', 'Single-room peaceful cottage surrounded by lush greenery, ideal for focused study.', 'assets/uploads/cottages/825354ff82bda1ab6b9dd0b67fd0ef0d.png', '2026-08-30 20:25:41'),
(4, 'Sunrise Haven Cottage', 'CSU Housing Office', NULL, '09195551234', 'auxiliary@csupiat.edu.ph', 'Official CSU-Piat Auxiliary and Housing Management Services.', 3, 3000.00, 'Available', 'Large family-style cottage with 3 bedrooms, living area, and porch.', 'assets/uploads/cottages/825354ff82bda1ab6b9dd0b67fd0ef0d.png', '2026-08-30 20:25:41'),
(5, 'Lilly', 'Lilly', NULL, '', '', NULL, 4, 1500.00, 'Available', 'Sample', 'assets/uploads/cottages/ab9b35ff135d5b2c252f1b31db15ddb7.png', '2026-09-16 21:20:23');

-- --------------------------------------------------------

--
-- Table structure for table `dormitories`
--

CREATE TABLE `dormitories` (
  `id` int(11) NOT NULL,
  `room_no` varchar(150) NOT NULL,
  `gender` enum('Male','Female') DEFAULT 'Male',
  `capacity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('Available','Occupied','Full') NOT NULL DEFAULT 'Available',
  `description` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `dormitories`
--

INSERT INTO `dormitories` (`id`, `room_no`, `gender`, `capacity`, `price`, `status`, `description`, `image_path`, `created_at`) VALUES
(1, 'Flowers Bloom', 'Male', 2, 500.00, 'Available', 'Sample', 'assets/uploads/dorms/977f2000225dfa62a12aed0648f35cf9.png', '2026-07-28 21:37:00'),
(2, 'Tender Juicy Quarter', 'Male', 2, 2500.00, 'Available', 'sample', 'assets/uploads/dorms/e938ece2162b6e141fc18cd3fee8e035.jpg', '2026-07-29 23:42:23'),
(3, 'Sampaguita Hall Room 101', 'Female', 4, 1200.00, 'Occupied', 'Spacious room near the study lounge with air conditioning and individual study desks.', 'assets/uploads/dorms/977f2000225dfa62a12aed0648f35cf9.png', '2026-08-30 20:25:41'),
(4, 'Narra Hall Room 204', 'Male', 2, 1500.00, 'Occupied', 'Quiet 2-person room on the 2nd floor with private bathroom and balcony.', 'assets/uploads/dorms/977f2000225dfa62a12aed0648f35cf9.png', '2026-08-30 20:25:41'),
(5, 'Ipil Hall Room 302', 'Female', 2, 1800.00, 'Occupied', 'Fully furnished room with double deck bed, built-in closets, and Wi-Fi access.', 'assets/uploads/dorms/977f2000225dfa62a12aed0648f35cf9.png', '2026-08-30 20:25:41'),
(6, 'Yakal Hall Room 105', 'Male', 4, 1000.00, 'Available', 'Standard 4-bed dormitory room with study area and shared lounge.', 'assets/uploads/dorms/977f2000225dfa62a12aed0648f35cf9.png', '2026-08-30 20:25:41'),
(7, 'qweqwe', 'Male', 2, 2.00, 'Available', 'qweqwe', 'assets/uploads/dorms/ee47b3b33b5f8572d4a73f4b78ce23ee.png', '2026-09-11 19:05:02');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `message` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `is_read` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `student_id`, `message`, `created_at`, `is_read`) VALUES
(4, 3, 'A reservation (#3) has been created for you by the admin.', '2026-08-19 06:56:45', 1),
(5, 3, 'Your reservation #3 has been approved.', '2026-08-19 06:56:57', 1),
(6, 7, 'Your reservation #4 has been approved! Welcome to CSU-Piat.', '2026-08-30 20:25:41', 0),
(7, 8, 'Your reservation #5 has been approved! Welcome to CSU-Piat.', '2026-08-30 20:25:41', 0),
(8, 9, 'Your reservation #6 has been approved! Welcome to CSU-Piat.', '2026-08-30 20:25:41', 0),
(9, 10, 'Your reservation #7 has been submitted and is pending approval.', '2026-08-30 20:25:41', 0),
(10, 11, 'Your reservation #8 has been approved! Welcome to CSU-Piat.', '2026-08-30 20:25:41', 0);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `method` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('Pending','Paid') NOT NULL DEFAULT 'Pending',
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `reservation_id`, `method`, `amount`, `status`, `date`) VALUES
(3, 3, 'Cash', 2500.00, 'Pending', '2026-08-19'),
(4, 4, 'GCash', 1200.00, 'Paid', '2026-08-30'),
(5, 5, 'Cash', 1500.00, 'Paid', '2026-08-30'),
(6, 6, 'Maya', 2200.00, 'Paid', '2026-08-30'),
(7, 7, 'Cash', 1800.00, 'Pending', '2026-08-30'),
(8, 8, 'GCash', 1600.00, 'Paid', '2026-08-30');

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `type` enum('Dormitory','Cottage') NOT NULL,
  `dorm_id` int(11) DEFAULT NULL,
  `cottage_id` int(11) DEFAULT NULL,
  `payment_method` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reservation_date` date NOT NULL,
  `payment_status` enum('Pending','Paid') NOT NULL DEFAULT 'Pending',
  `approval_status` enum('Pending','Approved','Declined','Cancelled') NOT NULL DEFAULT 'Pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`id`, `student_id`, `type`, `dorm_id`, `cottage_id`, `payment_method`, `amount`, `reservation_date`, `payment_status`, `approval_status`, `created_at`) VALUES
(3, 3, 'Dormitory', 2, NULL, 'Cash', 2500.00, '2026-08-19', 'Pending', 'Cancelled', '2026-08-19 06:56:45'),
(4, 7, 'Dormitory', 3, NULL, 'GCash', 1200.00, '2026-08-30', 'Paid', 'Approved', '2026-08-30 20:25:41'),
(5, 8, 'Dormitory', 4, NULL, 'Cash', 1500.00, '2026-08-30', 'Paid', 'Approved', '2026-08-30 20:25:41'),
(6, 9, 'Cottage', NULL, 2, 'Maya', 2200.00, '2026-08-30', 'Paid', 'Approved', '2026-08-30 20:25:41'),
(7, 10, 'Dormitory', 5, NULL, 'Cash', 1800.00, '2026-08-30', 'Pending', 'Pending', '2026-08-30 20:25:41'),
(8, 11, 'Cottage', NULL, 3, 'GCash', 1600.00, '2026-08-30', 'Paid', 'Approved', '2026-08-30 20:25:41');

-- --------------------------------------------------------

--
-- Table structure for table `reservation_backgrounds`
--

CREATE TABLE `reservation_backgrounds` (
  `id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `appliances` varchar(255) DEFAULT '',
  `friends_at_dorm` varchar(10) DEFAULT '',
  `friends_relationship` varchar(100) DEFAULT '',
  `reason` varchar(255) DEFAULT '',
  `medical_conditions` varchar(255) DEFAULT '',
  `severe_illness` varchar(255) DEFAULT '',
  `hobbies` varchar(255) DEFAULT '',
  `smoking` varchar(10) DEFAULT '',
  `drinking` varchar(20) DEFAULT '',
  `organizations` varchar(255) DEFAULT '',
  `leisure` varchar(255) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reservation_backgrounds`
--

INSERT INTO `reservation_backgrounds` (`id`, `reservation_id`, `appliances`, `friends_at_dorm`, `friends_relationship`, `reason`, `medical_conditions`, `severe_illness`, `hobbies`, `smoking`, `drinking`, `organizations`, `leisure`) VALUES
(3, 3, 'na', 'No', 'barak obama', 'dunno', 'None', 'None', 'na', 'No', 'No', 'na', 'na'),
(4, 4, 'Laptop, Electric Fan, Phone Charger', 'Yes', 'High School Classmate', 'Closer to campus to reduce daily commute time.', 'None', 'None', 'Reading, Coding, Playing Guitar', 'No', 'No', 'CSU IT Society', 'Badminton and Board games'),
(5, 5, 'Electric Fan, Desk Lamp', 'No', 'None', 'Early morning field research and laboratory access.', 'Mild Asthma', 'None', 'Basketball, Gardening', 'No', 'Occasional', 'Junior Agriculturists Association', 'Watching sports and jogging'),
(6, 6, 'Laptop, Rice Cooker, Hair Dryer', 'Yes', 'Cousin', 'Prefers cottage environment with kitchen for culinary practice.', 'None', 'None', 'Baking, Photography', 'No', 'No', 'Hospitality Leaders Guild', 'Cooking and Watercolor painting'),
(7, 7, 'Iron, Electric Fan, Laptop', 'Yes', 'Squadmate', 'Convenient stay for internship and board exam review sessions.', 'None', 'None', 'Running, Martial Arts', 'No', 'No', 'Crim Student Council', 'Weightlifting and Cycling'),
(8, 8, 'Laptop, Printer, Electric Fan', 'No', 'None', 'Quiet place for lesson planning and preparation of instructional materials.', 'None', 'None', 'Crafting, Storytelling, Singing', 'No', 'No', 'Future Educators Association', 'Reading educational books and music');

-- --------------------------------------------------------

--
-- Table structure for table `reservation_parent_info`
--

CREATE TABLE `reservation_parent_info` (
  `id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `father_name` varchar(150) DEFAULT '',
  `mother_name` varchar(150) DEFAULT '',
  `occupation` varchar(150) DEFAULT '',
  `education` varchar(150) DEFAULT '',
  `address` varchar(255) DEFAULT '',
  `phone` varchar(30) DEFAULT '',
  `emergency_contact` varchar(150) DEFAULT '',
  `relationship` varchar(100) DEFAULT '',
  `emergency_number` varchar(30) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reservation_parent_info`
--

INSERT INTO `reservation_parent_info` (`id`, `reservation_id`, `father_name`, `mother_name`, `occupation`, `education`, `address`, `phone`, `emergency_contact`, `relationship`, `emergency_number`) VALUES
(3, 3, 'sample', 'sample', 'sample', 'sample', 'sample', '09557997409', 'sample', 'freni', '09557997405'),
(4, 4, 'Roberto De Los Santos', 'Clara De Los Santos', 'Civil Engineer', 'College Graduate', 'Centro 2, Piat, Cagayan', '09181112233', 'Roberto De Los Santos', 'Father', '09181112233'),
(5, 5, 'Danilo Bautista', 'Elena Bautista', 'Farmer / Business Owner', 'High School Graduate', 'Maguilling, Piat, Cagayan', '09192223344', 'Elena Bautista', 'Mother', '09192223344'),
(6, 6, 'Eduardo Mendoza', 'Corazon Mendoza', 'Teacher', 'Master\'s Degree', 'Sto. Domingo, Piat, Cagayan', '09203334455', 'Corazon Mendoza', 'Mother', '09203334455'),
(7, 7, 'Nestor Navarro', 'Lorna Navarro', 'Police Officer', 'College Graduate', 'Baung, Piat, Cagayan', '09214445566', 'Nestor Navarro', 'Father', '09214445566'),
(8, 8, 'Arman Villanueva', 'Teresa Villanueva', 'Accountant', 'College Graduate', 'Poblacion, Piat, Cagayan', '09225556677', 'Teresa Villanueva', 'Mother', '09225556677');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `student_no` varchar(20) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `security_question` varchar(255) NOT NULL,
  `security_answer_hash` varchar(255) NOT NULL,
  `course` varchar(150) DEFAULT '',
  `year_level` varchar(50) DEFAULT '',
  `semester` varchar(50) DEFAULT '',
  `nationality` varchar(100) DEFAULT 'Filipino',
  `address` varchar(255) DEFAULT '',
  `birthday` date DEFAULT NULL,
  `phone` varchar(30) DEFAULT '',
  `profile_pic_path` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `date_registered` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `student_no`, `first_name`, `last_name`, `email`, `password_hash`, `security_question`, `security_answer_hash`, `course`, `year_level`, `semester`, `nationality`, `address`, `birthday`, `phone`, `profile_pic_path`, `status`, `date_registered`) VALUES
(3, 'STU-0003', 'Juan', 'Santos', 'juansantos@gmail.com', '$2y$10$OHgXHUaY093UDJpyy8oWu.iep6aM.NkD3ehTtG/JfK4iFCEw2AUAW', 'What is your mother\'s maiden name?', '$2y$10$XbnPQ4U5/LCOFCId611ZZ.j5deBBOJlgxlQz7Iwy01z4qP7t8Lu0C', 'BS Information Technology', '1st Year', '1st Semester', 'Filipino', '', NULL, '09555797749', NULL, 'Active', '2026-07-13 19:49:25'),
(7, 'STU-0004', 'Maria Clara', 'De Los Santos', 'maria.delossantos@gmail.com', '$2y$10$tkJ7mqd5/COiL3UFt9n7nubAW0LbfS8g3Fe7JLY7Fz6wxSBbHHPYq', 'What is your mother\'s maiden name?', '$2y$10$MdH0a48MzI./tEV5urOrze3dFaH5yIZqsITn37hgmsu4sykq7DW8a', 'BS Information Technology', '2nd Year', '1st Semester', 'Filipino', 'Centro 2, Piat, Cagayan', '2004-05-14', '09171234501', NULL, 'Active', '2026-08-30 20:25:41'),
(8, 'STU-0005', 'Angelo', 'Bautista', 'angelo.bautista@gmail.com', '$2y$10$tkJ7mqd5/COiL3UFt9n7nubAW0LbfS8g3Fe7JLY7Fz6wxSBbHHPYq', 'What is your mother\'s maiden name?', '$2y$10$MdH0a48MzI./tEV5urOrze3dFaH5yIZqsITn37hgmsu4sykq7DW8a', 'BS Agriculture', '3rd Year', '1st Semester', 'Filipino', 'Maguilling, Piat, Cagayan', '2003-11-20', '09171234502', NULL, 'Active', '2026-08-30 20:25:41'),
(9, 'STU-0006', 'Beatriz', 'Mendoza', 'beatriz.mendoza@gmail.com', '$2y$10$tkJ7mqd5/COiL3UFt9n7nubAW0LbfS8g3Fe7JLY7Fz6wxSBbHHPYq', 'What is your mother\'s maiden name?', '$2y$10$MdH0a48MzI./tEV5urOrze3dFaH5yIZqsITn37hgmsu4sykq7DW8a', 'BS Hospitality Management', '1st Year', '1st Semester', 'Filipino', 'Sto. Domingo, Piat, Cagayan', '2005-03-08', '09171234503', NULL, 'Active', '2026-08-30 20:25:41'),
(10, 'STU-0007', 'Christian', 'Navarro', 'christian.navarro@gmail.com', '$2y$10$tkJ7mqd5/COiL3UFt9n7nubAW0LbfS8g3Fe7JLY7Fz6wxSBbHHPYq', 'What is your mother\'s maiden name?', '$2y$10$MdH0a48MzI./tEV5urOrze3dFaH5yIZqsITn37hgmsu4sykq7DW8a', 'BS Criminology', '4th Year', '1st Semester', 'Filipino', 'Baung, Piat, Cagayan', '2002-09-17', '09171234504', NULL, 'Active', '2026-08-30 20:25:41'),
(11, 'STU-0008', 'Diana Rose', 'Villanueva', 'diana.villanueva@gmail.com', '$2y$10$tkJ7mqd5/COiL3UFt9n7nubAW0LbfS8g3Fe7JLY7Fz6wxSBbHHPYq', 'What is your mother\'s maiden name?', '$2y$10$MdH0a48MzI./tEV5urOrze3dFaH5yIZqsITn37hgmsu4sykq7DW8a', 'Bachelor of Elementary Education', '2nd Year', '1st Semester', 'Filipino', 'Poblacion, Piat, Cagayan', '2004-12-02', '09171234505', NULL, 'Active', '2026-08-30 20:25:41');

-- --------------------------------------------------------

--
-- Table structure for table `student_backgrounds`
--

CREATE TABLE `student_backgrounds` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `appliances` varchar(255) DEFAULT '',
  `friends_at_dorm` varchar(10) DEFAULT '',
  `friends_relationship` varchar(100) DEFAULT '',
  `reason` varchar(255) DEFAULT '',
  `medical_conditions` varchar(255) DEFAULT '',
  `severe_illness` varchar(255) DEFAULT '',
  `hobbies` varchar(255) DEFAULT '',
  `smoking` varchar(10) DEFAULT '',
  `drinking` varchar(20) DEFAULT '',
  `organizations` varchar(255) DEFAULT '',
  `leisure` varchar(255) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_backgrounds`
--

INSERT INTO `student_backgrounds` (`id`, `student_id`, `appliances`, `friends_at_dorm`, `friends_relationship`, `reason`, `medical_conditions`, `severe_illness`, `hobbies`, `smoking`, `drinking`, `organizations`, `leisure`) VALUES
(1, 11, 'Laptop, Printer, Electric Fan', 'No', 'None', 'Quiet place for lesson planning and preparation of instructional materials.', 'None', 'None', 'Crafting, Storytelling, Singing', 'No', 'No', 'Future Educators Association', 'Reading educational books and music'),
(2, 10, 'Iron, Electric Fan, Laptop', 'Yes', 'Squadmate', 'Convenient stay for internship and board exam review sessions.', 'None', 'None', 'Running, Martial Arts', 'No', 'No', 'Crim Student Council', 'Weightlifting and Cycling'),
(3, 9, 'Laptop, Rice Cooker, Hair Dryer', 'Yes', 'Cousin', 'Prefers cottage environment with kitchen for culinary practice.', 'None', 'None', 'Baking, Photography', 'No', 'No', 'Hospitality Leaders Guild', 'Cooking and Watercolor painting'),
(4, 8, 'Electric Fan, Desk Lamp', 'No', 'None', 'Early morning field research and laboratory access.', 'Mild Asthma', 'None', 'Basketball, Gardening', 'No', 'Occasional', 'Junior Agriculturists Association', 'Watching sports and jogging'),
(5, 7, 'Laptop, Electric Fan, Phone Charger', 'Yes', 'High School Classmate', 'Closer to campus to reduce daily commute time.', 'None', 'None', 'Reading, Coding, Playing Guitar', 'No', 'No', 'CSU IT Society', 'Badminton and Board games'),
(6, 3, 'na', 'No', 'barak obama', 'dunno', 'None', 'None', 'na', 'No', 'No', 'na', 'na');

-- --------------------------------------------------------

--
-- Table structure for table `student_parent_info`
--

CREATE TABLE `student_parent_info` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `father_name` varchar(150) DEFAULT '',
  `mother_name` varchar(150) DEFAULT '',
  `occupation` varchar(150) DEFAULT '',
  `education` varchar(150) DEFAULT '',
  `address` varchar(255) DEFAULT '',
  `phone` varchar(30) DEFAULT '',
  `emergency_contact` varchar(150) DEFAULT '',
  `relationship` varchar(100) DEFAULT '',
  `emergency_number` varchar(30) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_parent_info`
--

INSERT INTO `student_parent_info` (`id`, `student_id`, `father_name`, `mother_name`, `occupation`, `education`, `address`, `phone`, `emergency_contact`, `relationship`, `emergency_number`) VALUES
(1, 11, 'Arman Villanueva', 'Teresa Villanueva', 'Accountant', 'College Graduate', 'Poblacion, Piat, Cagayan', '09225556677', 'Teresa Villanueva', 'Mother', '09225556677'),
(2, 10, 'Nestor Navarro', 'Lorna Navarro', 'Police Officer', 'College Graduate', 'Baung, Piat, Cagayan', '09214445566', 'Nestor Navarro', 'Father', '09214445566'),
(3, 9, 'Eduardo Mendoza', 'Corazon Mendoza', 'Teacher', 'Master\'s Degree', 'Sto. Domingo, Piat, Cagayan', '09203334455', 'Corazon Mendoza', 'Mother', '09203334455'),
(4, 8, 'Danilo Bautista', 'Elena Bautista', 'Farmer / Business Owner', 'High School Graduate', 'Maguilling, Piat, Cagayan', '09192223344', 'Elena Bautista', 'Mother', '09192223344'),
(5, 7, 'Roberto De Los Santos', 'Clara De Los Santos', 'Civil Engineer', 'College Graduate', 'Centro 2, Piat, Cagayan', '09181112233', 'Roberto De Los Santos', 'Father', '09181112233'),
(6, 3, 'sample', 'sample', 'sample', 'sample', 'sample', '09557997409', 'sample', 'freni', '09557997405');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `cottages`
--
ALTER TABLE `cottages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dormitories`
--
ALTER TABLE `dormitories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_no` (`room_no`),
  ADD UNIQUE KEY `room_no_2` (`room_no`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notif_student` (`student_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pay_res` (`reservation_id`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_res_student` (`student_id`),
  ADD KEY `fk_res_dorm` (`dorm_id`),
  ADD KEY `fk_res_cottage` (`cottage_id`);

--
-- Indexes for table `reservation_backgrounds`
--
ALTER TABLE `reservation_backgrounds`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reservation_id` (`reservation_id`);

--
-- Indexes for table `reservation_parent_info`
--
ALTER TABLE `reservation_parent_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reservation_id` (`reservation_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_no` (`student_no`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `student_backgrounds`
--
ALTER TABLE `student_backgrounds`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`);

--
-- Indexes for table `student_parent_info`
--
ALTER TABLE `student_parent_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cottages`
--
ALTER TABLE `cottages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `dormitories`
--
ALTER TABLE `dormitories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reservation_backgrounds`
--
ALTER TABLE `reservation_backgrounds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `reservation_parent_info`
--
ALTER TABLE `reservation_parent_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `student_backgrounds`
--
ALTER TABLE `student_backgrounds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `student_parent_info`
--
ALTER TABLE `student_parent_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_pay_res` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `fk_res_cottage` FOREIGN KEY (`cottage_id`) REFERENCES `cottages` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_res_dorm` FOREIGN KEY (`dorm_id`) REFERENCES `dormitories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_res_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reservation_backgrounds`
--
ALTER TABLE `reservation_backgrounds`
  ADD CONSTRAINT `fk_bg_res` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reservation_parent_info`
--
ALTER TABLE `reservation_parent_info`
  ADD CONSTRAINT `fk_parent_res` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_backgrounds`
--
ALTER TABLE `student_backgrounds`
  ADD CONSTRAINT `fk_student_bg` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_parent_info`
--
ALTER TABLE `student_parent_info`
  ADD CONSTRAINT `fk_student_parent` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
