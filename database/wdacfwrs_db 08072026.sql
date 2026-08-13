-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 08, 2026 at 12:02 AM
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

INSERT INTO `cottages` (`id`, `name`, `owner`, `rooms`, `price`, `availability`, `description`, `image_path`, `created_at`) VALUES
(1, 'Kubutel A', 'Anti Claire', 1, 599.00, 'Available', 'Sample priiiii', 'assets/uploads/cottages/825354ff82bda1ab6b9dd0b67fd0ef0d.png', '2026-08-07 23:43:47');

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
(2, 'Tender Juicy Quarter', 'Male', 2, 2500.00, 'Available', 'sample', 'assets/uploads/dorms/e938ece2162b6e141fc18cd3fee8e035.jpg', '2026-07-29 23:42:23');

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
(3, 'STU-0003', 'Juan', 'Santos', 'juansantos@gmail.com', '$2y$10$OHgXHUaY093UDJpyy8oWu.iep6aM.NkD3ehTtG/JfK4iFCEw2AUAW', 'What is your mother\'s maiden name?', '$2y$10$XbnPQ4U5/LCOFCId611ZZ.j5deBBOJlgxlQz7Iwy01z4qP7t8Lu0C', 'BS Information Technology', '1st Year', '1st Semester', 'Filipino', '', NULL, '09555797749', NULL, 'Active', '2026-07-13 19:49:25');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `dormitories`
--
ALTER TABLE `dormitories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reservation_backgrounds`
--
ALTER TABLE `reservation_backgrounds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `reservation_parent_info`
--
ALTER TABLE `reservation_parent_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
