# WDACFWRS — Master System Memory & Synchronization Matrix

> **Source of Truth for System Architecture, Connected Files, and Change Propagation.**  
> Whenever any file, database column, API endpoint, or UI function is modified, consult this memory to identify and synchronize all connected files and functions.

---

## 1. System Architecture Overview

- **Backend Runtime**: PHP 8.2+ (ZTS Visual C++ 2019 x64) on Apache (XAMPP).
- **Database**: MariaDB / MySQL (`wdacfwrs_db`), utf8mb4. Accessed exclusively via PDO with prepared statements.
- **Frontend Architecture**: Bootstrap 5.3.3 + FontAwesome 6.5.2 + vanilla JavaScript ES6. No heavy build step.
- **Unified Color & Design System**: Modern Warm Orange Gradient theme (`assets/css/style.css`).
  - Primary Orange: `#EA580C` (Deep rich orange), `#F97316` (Bright warm orange), `#FB923C` (Soft accent), `#FBBF24` (Golden sun).
  - Brand Gradients: `--brand-gradient`, `--brand-gradient-panel`, `--brand-gradient-btn`.
  - All foreign blue colors (e.g. Bootstrap default `#0d6efd`, `bg-info`, blue links, blue active nav tabs/pills, blue focus rings, blue toasts) are strictly overridden to match the warm orange gradient system.
- **API Communication**: REST-like JSON over HTTP (`/api/<module>/<action>.php`).
  - Frontend fetch client: `assets/js/data.js` (`DataAPI`) and `assets/js/auth.js` (`Auth`).
  - Request/Response format: JSON payload in request body, JSON response `{ ok: boolean, ... }`.
  - Multipart Form Data used only for file uploads (`FormData`).
- **Session & Auth**: Isolated PHP session cookies (`WDACFWRS_SESSID`, `HttpOnly`, `SameSite=Lax`). Passwords & security answers hashed using `password_hash(..., PASSWORD_DEFAULT)`. Strict role validation (`'admin'` or `'student'`) ensures zero collision with external apps running on the same host.

---

## 2. Database Schema & Data Dictionary

The database consists of **11 tables** with explicit foreign keys and check constraints:

| Table | Primary Key | Foreign Keys / Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| `admins` | `id INT AUTO_INCREMENT` | `email UNIQUE` | Administrative accounts (role, security question/answer hash) |
| `students` | `id INT AUTO_INCREMENT` | `student_no UNIQUE`, `email UNIQUE` | Student accounts, profile details, academic info, status |
| `student_parent_info` | `id INT AUTO_INCREMENT` | `student_id -> students(id)` (CASCADE, UNIQUE) | Student profile parent/guardian background & emergency contacts |
| `student_backgrounds` | `id INT AUTO_INCREMENT` | `student_id -> students(id)` (CASCADE, UNIQUE) | Student profile habits, appliances, medical conditions, hobbies |
| `dormitories` | `id INT AUTO_INCREMENT` | `room_no UNIQUE` | Dorm rooms (capacity, price, status: Available/Occupied/Full) |
| `cottages` | `id INT AUTO_INCREMENT` | — | Cottages (owner profile [name, photo, phone, email, bio], rooms, price, availability: Available/Booked) |
| `reservations` | `id INT AUTO_INCREMENT` | `student_id -> students(id)` (CASCADE)<br>`dorm_id -> dormitories(id)` (SET NULL)<br>`cottage_id -> cottages(id)` (SET NULL)<br>`chk_res_asset`: Exactly one asset ID per type | Core reservation records, payment status, approval status |
| `reservation_parent_info` | `id INT AUTO_INCREMENT` | `reservation_id -> reservations(id)` (CASCADE, UNIQUE) | Parent/guardian background on specific reservation snapshot |
| `reservation_backgrounds` | `id INT AUTO_INCREMENT` | `reservation_id -> reservations(id)` (CASCADE, UNIQUE) | Student background on specific reservation snapshot |
| `payments` | `id INT AUTO_INCREMENT` | `reservation_id -> reservations(id)` (CASCADE) | Payment records tied to reservations |
| `notifications` | `id INT AUTO_INCREMENT` | `student_id -> students(id)` (CASCADE) | In-app student alerts with `is_read` status |

---

## 3. Data Transformation & Field Mapping

Backend database columns use **`snake_case`**, while the JSON API and Frontend JavaScript use **`camelCase`**.  
Helper modules in `api/<module>/_helpers.php` normalize these transformations:

### A. Dormitories (`api/dorms/_helpers.php` -> `map_dorm()`)
| Database Column (`dormitories`) | JSON Field (`DataAPI`) | Frontend Usage |
| :--- | :--- | :--- |
| `id` | `id` (int) | Card ID, edit ID, delete ID, reservation assetId |
| `room_no` | `roomNumber`, `dormitoryName`, `name` | Room title, badges, filters |
| `gender` | `gender` ('Male', 'Female') | Filter pill, room tag |
| `capacity` | `capacity` (int) | Badge, capacity counter |
| `price` | `price` (float) | Price tag (₱/month) |
| `status` | `status` ('Available', 'Occupied', 'Full') | Status badge, booking guard |
| `description` | `description` | Modal detail, card summary |
| `image_path` | `image` | Resolved via `resolveAsset(path)` |
| Calculated | `reservedByMe` (bool) | Indicates if current logged student booked this |

### B. Cottages (`api/cottages/_helpers.php` -> `map_cottage()`)
| Database Column (`cottages`) | JSON Field (`DataAPI`) | Frontend Usage |
| :--- | :--- | :--- |
| `id` | `id` (int) | Card ID, edit ID, delete ID |
| `name` | `name` | Cottage title, search filter |
| `owner` | `owner` | Owner name in card, showcase & detail modal |
| `owner_photo` | `ownerPhoto` | Owner profile photo in showcase & detail modal |
| `owner_phone` | `ownerPhone` | Owner contact phone number |
| `owner_email` | `ownerEmail` | Owner email address |
| `owner_bio` | `ownerBio` | Owner biography / caretaker notes |
| `rooms` | `rooms` (int) | Number of rooms badge |
| `price` | `price` (float) | Price tag (₱) |
| `availability` | `availability` ('Available', 'Booked') | Availability badge, booking guard |
| `description` | `description` | Description text |
| `image_path` | `image` | Resolved via `resolveAsset(path)` |
| Calculated | `reservedByMe` (bool) | Indicates if current logged student booked this |

### C. Reservations (`api/reservations/_helpers.php` -> `map_reservation()`)
| Database Column | JSON Field (`DataAPI`) | Frontend Usage |
| :--- | :--- | :--- |
| `r.id` | `id` (int) | Reservation #, modal lookups, approval targets |
| `r.student_id` | `studentId` (int) | Student reference |
| `s.first_name + s.last_name` | `studentName` | Student column in admin tables & print view |
| `r.type` | `type` ('Dormitory', 'Cottage') | Type filter & asset type switch |
| `r.dorm_id` / `r.cottage_id` | `assetId` (int) | Target asset reference |
| `d.room_no` / `c.name` | `assetLabel` | Name shown on badge and table |
| `d.image_path` / `c.image_path`| `image` | Asset thumbnail image |
| `r.payment_method` | `paymentMethod` | 'Cash', 'GCash', etc. |
| `r.amount` | `amount` (float) | Reservation fee |
| `r.reservation_date` | `reservationDate` | Scheduled date |
| `r.payment_status` | `paymentStatus` | 'Pending', 'Paid' |
| `r.approval_status` | `approvalStatus` | 'Pending', 'Approved', 'Declined', 'Cancelled' |
| `pi.*` (9 columns) | `parentInfo: { ... }` | View modal & printable slip |
| `bg.*` (11 columns) | `studentBackground: { ... }` | View modal student details |

### D. Students (`api/users/_helpers.php` -> `map_student()`)
| Database Column (`students`) | JSON Field (`DataAPI`) | Frontend Usage |
| :--- | :--- | :--- |
| `id` | `id` (int) | Student ID |
| `student_no` | `studentNo` | Student ID badge (e.g. `STU-0001`) |
| `first_name` | `firstName` | Name field |
| `last_name` | `lastName` | Name field |
| `course` / `year_level` / `semester` | `course`, `yearLevel`, `semester` | Academic info |
| `status` | `status` ('Active', 'Inactive') | Account status toggle |
| `date_registered` | `dateRegistered` | Date formatted YYYY-MM-DD |
| `profile_pic_path` | `profilePic` | Avatar image |

---

## 4. Module Map & Connected Files Directory

```
├── Database & Config
│   ├── config/database.php           <-- Central PDO factory (get_db())
│   └── database/schema.sql           <-- Database definition, constraints & admin seed
│
├── Core API Infrastructure
│   ├── api/_bootstrap.php            <-- Session, json_input(), respond(), fail(), require_role()
│   └── api/_uploads.php              <-- File upload validator & mover (mime, size, uuid filenames)
│
├── Authentication Domain
│   ├── api/auth/login.php
│   ├── api/auth/logout.php
│   ├── api/auth/register.php
│   ├── api/auth/session.php
│   ├── api/auth/forgot_lookup.php
│   ├── api/auth/forgot_verify.php
│   ├── api/auth/forgot_reset.php
│   ├── assets/js/auth.js             <-- Client Auth object (login, register, reset, requireRole, logout)
│   ├── index.html                    <-- Login portal (Role toggle: Student / Admin + Guest Link)
│   ├── register.html                 <-- Student registration form + Guest Link
│   └── forgot-password.html          <-- 3-step security question password reset
│
├── Guest / Public Explorer Domain
│   ├── guest.html                    <-- Public unit explorer page (no login required)
│   ├── assets/js/guest.js            <-- Guest UI controller (live filters, details modal, reserve prompts)
│   ├── api/dorms/list.php, get.php   <-- Public read allowed (unauthenticated session safe)
│   └── api/cottages/list.php, get.php<-- Public read allowed (unauthenticated session safe)
│
├── Dormitories Domain
│   ├── api/dorms/_helpers.php        <-- map_dorm()
│   ├── api/dorms/list.php            <-- Filters by gender, status, search
│   ├── api/dorms/get.php             <-- Single dorm details
│   ├── api/dorms/create.php          <-- Multipart create + image
│   ├── api/dorms/update.php          <-- Multipart update + image
│   ├── api/dorms/delete.php          <-- Delete dorm (guarded by existing reservations)
│   ├── assets/js/data.js             <-- DataAPI.getDorms, getDorm, createDorm, updateDorm, deleteDorm
│   ├── admin/dormitories.html        <-- Admin management UI + Add/Edit Modal
│   ├── assets/js/admin-dormitories.js<-- Admin dorm CRUD controller
│   ├── user/rooms.html               <-- Student catalog & search
│   ├── assets/js/user-rooms.js       <-- Student catalog controller
│   └── user/dashboard.html           <-- Student dashboard dorm preview
│
├── Cottages Domain
│   ├── api/cottages/_helpers.php     <-- map_cottage()
│   ├── api/cottages/list.php         <-- Filters by availability, search
│   ├── api/cottages/get.php          <-- Single cottage details
│   ├── api/cottages/create.php       <-- Multipart create + image
│   ├── api/cottages/update.php       <-- Multipart update + image
│   ├── api/cottages/delete.php       <-- Delete cottage
│   ├── assets/js/data.js             <-- DataAPI.getCottages, getCottage, createCottage, updateCottage, deleteCottage
│   ├── admin/cottages.html           <-- Admin cottage management UI
│   ├── assets/js/admin-cottages.js   <-- Admin cottage CRUD controller
│   └── user/rooms.html               <-- Student catalog tab for cottages
│
├── Reservations Domain
│   ├── api/reservations/_helpers.php <-- RESERVATION_SELECT, JOINS, map_reservation()
│   ├── api/reservations/create.php   <-- Transactional: SELECT FOR UPDATE, auto-pull parent/bg, check approved, flip asset
│   ├── api/reservations/update.php   <-- Admin update reservation details with asset status sync
│   ├── api/reservations/list.php     <-- Role-scoped (admin gets all + filters; student gets only own)
│   ├── api/reservations/get.php      <-- Detail fetch
│   ├── api/reservations/approve.php  <-- Admin approve + student notification
│   ├── api/reservations/decline.php  <-- Admin decline + revert asset to Available + notify
│   ├── api/reservations/cancel.php   <-- Student cancel + revert asset to Available + notify
│   ├── assets/js/data.js             <-- DataAPI.createReservation, updateReservation, getReservations, approve/decline/cancel
│   ├── admin/reservations.html       <-- Admin reservation management list & Edit modal
│   ├── assets/js/admin-reservations.js<-- Admin approve/decline/edit/view/print handlers
│   ├── user/reserve.html             <-- 3-step student booking wizard with approved lock check
│   ├── assets/js/user-reserve.js     <-- Wizard controller & validation
│   ├── user/my-reservations.html     <-- Student reservation cards, approved banner & cancel action
│   └── assets/js/user-reservations.js<-- Student reservation controller & print view
│
├── Dashboard & Reports Domain
│   ├── api/dashboard/admin_stats.php <-- Aggregates: counts, occupancy rates, monthly trends, revenue
│   ├── api/reports/generate.php      <-- PDF/table reports: reservations, dorm/cottage occupancy, revenue, registrations
│   ├── admin/dashboard.html          <-- Admin dashboard cards + Chart.js charts
│   ├── assets/js/admin-dashboard.js  <-- Admin dashboard stats loader
│   ├── admin/reports.html            <-- Admin reports tab (list view, official signatories, print, auto-download PDF)
│   └── assets/js/admin-reports.js    <-- Report generator, signatories loader & export controller
│
├── Notifications Domain
│   ├── api/notifications/list.php    <-- Student notification list
│   ├── api/notifications/mark_read.php<-- Mark notification read
│   ├── assets/js/data.js             <-- DataAPI.getNotifications, markNotificationRead
│   └── assets/js/layout.js           <-- Topbar notification bell & dropdown loader
│
├── Student Users & Profiles Domain
│   ├── api/users/list.php, get.php, set_status.php
│   ├── api/profile/get.php, update.php, change_password.php, upload_picture.php
│   ├── admin/users.html, assets/js/admin-users.js
│   └── user/profile.html, assets/js/user-profile.js (personal, parent/guardian, and background info)
│
└── Admin Profile & Settings Domain
    ├── api/settings/get.php, profile.php, security.php, password.php
    ├── admin/settings.html           <-- Admin "My Profile" management
    └── assets/js/admin-settings.js
```

---

## 5. Change Synchronization Matrix

When any change is made, use this matrix to locate and update **every connected file and function**.

### Matrix 1: Modifying or Adding a Database Column
*Example: Adding `wifi_available` to `dormitories` table.*
1. **Schema**: Update `database/schema.sql` (and execute `ALTER TABLE dormitories ADD COLUMN wifi_available ...` on live DB).
2. **Helper Mapping**: Update `api/dorms/_helpers.php` (`map_dorm()`) to include `'wifiAvailable' => (bool)$r['wifi_available']`.
3. **Backend Endpoints**:
   - `api/dorms/create.php`: Read `$_POST['wifiAvailable']` / `$_POST['wifi_available']` and include in `INSERT INTO dormitories ...`.
   - `api/dorms/update.php`: Update `UPDATE dormitories SET ..., wifi_available = ? WHERE id = ?`.
   - `api/dorms/list.php`: Ensure filter parameters allow filtering by wifi if required.
4. **Admin UI & JS**:
   - `admin/dormitories.html`: Add the input field/checkbox to `#dorm-modal`.
   - `assets/js/admin-dormitories.js`:
     - In `openModal()`: Pre-populate the new field from `d.wifiAvailable`.
     - In form submit handler: Append field to `FormData`.
     - In `renderTable()`: Add badge/indicator column if needed.
5. **Student UI & JS**:
   - `user/rooms.html`: Display badge on dorm card and add to search/filter dropdown.
   - `assets/js/user-rooms.js`: Render the new property in the card template and detail modal.
   - `user/reserve.html`: Display property in Step 1 asset summary.
6. **Reports**:
   - If included in occupancy or facility reports, update `api/reports/generate.php`.

---

### Matrix 2: Modifying Reservation Status or Flow
*Example: Adding a new status `Completed` or changing status behavior.*
1. **Schema**: Update `database/schema.sql` enum: `approval_status ENUM('Pending','Approved','Declined','Cancelled','Completed')`.
2. **Backend Endpoints**:
   - `api/reservations/approve.php`, `decline.php`, `cancel.php`, or new `api/reservations/complete.php`.
   - Ensure asset availability reverting logic in `_helpers.php` handles asset status transitions properly.
3. **Frontend API Client**:
   - Update `assets/js/data.js` if a new action method is added (`DataAPI.completeReservation`).
4. **Admin Reservations UI & JS**:
   - `admin/reservations.html`: Update status filter `<select id="filter-approval">`.
   - `assets/js/admin-reservations.js`:
     - Update `badgeClass(status)` to style the new status badge.
     - Add action button in table render.
5. **Student Reservations UI & JS**:
   - `user/my-reservations.html` & `assets/js/user-reservations.js`: Update badge rendering and button visibility (e.g. only allow Cancel on Pending/Approved).
6. **Dashboard & Reports**:
   - `api/dashboard/admin_stats.php`: Update SQL breakdown counts (`COUNT(CASE WHEN approval_status = ...)`).
   - `api/reports/generate.php`: Include new status in reports.

---

### Matrix 3: Modifying an API Endpoint Contract
*Example: Changing input parameters or return payload of `api/profile/update.php`.*
1. **Backend Endpoint**: Update `api/profile/update.php` JSON input validation and PDO query.
2. **API Client**: Verify `DataAPI.updateProfile(payload)` in `assets/js/data.js` passes the right format.
3. **Calling Pages**:
   - Check `assets/js/user-profile.js`: Update form field reading, validation, and error display.
   - Check `user/profile.html`: Ensure all input `name` and `id` attributes match the JS selectors.

---

### Matrix 4: Modifying User Authentication or Student Fields
*Example: Adding a `guardian_contact` field to students.*
1. **Schema**: Update `database/schema.sql` (`students` table).
2. **Registration Endpoint**: Update `api/auth/register.php` (read parameter, validate, insert).
3. **Registration UI**: Update `register.html` (input field and submit listener).
4. **Profile Endpoints**:
   - `api/profile/get.php` (returns the new field).
   - `api/profile/update.php` (updates the new field).
5. **Profile UI**:
   - `user/profile.html` (add input field).
   - `assets/js/user-profile.js` (load and save field).
6. **Admin User Management**:
   - `api/users/_helpers.php` (`map_student()`).
   - `admin/users.html` (detail modal).
   - `assets/js/admin-users.js` (render in view modal).

---

## 6. Architecture Invariants & Golden Rules

1. **Transaction Safety for Reservations**:
   - Any booking or asset status update MUST be executed inside a PDO transaction (`$pdo->beginTransaction()`).
   - Always re-check asset availability using `SELECT ... FOR UPDATE` before inserting the reservation.
2. **Session Security & Role Authorization**:
   - Every API endpoint MUST include `require_once __DIR__ . '/../_bootstrap.php'`.
   - Admin-only endpoints MUST call `require_role('admin')`.
   - Student-only endpoints MUST call `require_role('student')`.
   - Student data endpoints MUST filter by `$_SESSION['user']['id']` server-side, never trusting client-supplied user IDs.
   - Student registered legal names (`first_name`, `last_name`) are immutable on self-service profile editing (`user/profile.html` and `api/profile/update.php`).
3. **Image Uploads**:
   - Always process uploads through `save_uploaded_image()` in `api/_uploads.php`.
   - Store only relative paths (`assets/uploads/...`) in the database.
   - On the frontend, always wrap image URLs in `resolveAsset(path)` to ensure correct relative pathing across `/admin/`, `/user/`, and root pages.
4. **Clean Decoupling**:
   - HTML pages must contain structure and modals only.
   - JavaScript controllers handle all data fetching and DOM events.
   - Page titles and user avatars in topbars/sidebars are dynamically injected via `assets/js/layout.js`.
5. **Password Policy & Validation**:
   - All passwords must be alphanumeric: at least 6 characters in length, containing at least one letter and at least one number (special characters permitted).
   - Validated on the backend via `is_valid_password()` in `api/_bootstrap.php` across `api/auth/register.php`, `api/auth/forgot_reset.php`, `api/profile/change_password.php`, and `api/settings/password.php`.
   - Synchronized on the frontend via `isValidPassword()` in `assets/js/ui.js` across `register.html`, `forgot-password.html`, `user/profile.html` (`assets/js/user-profile.js`), and `admin/settings.html` (`assets/js/admin-settings.js`).
6. **Mandatory Profile & Parent Background Policy**:
   - Any newly registered student or student with missing parent/guardian background (Father or Mother Name, Emergency Contact Person, Relationship, and Emergency Contact Number) MUST complete these details before submitting room reservations.
   - **Backend Guard**: Enforced via `check_profile_completion()` in `api/users/_helpers.php`, guarded in `api/reservations/create.php` (returns 403 error), and validated on `api/profile/update.php`.
   - **Frontend Guard**: `index.html` guides newly registered students with incomplete profiles directly to `user/profile.html?required=1`; `user/dashboard.html` and `user/rooms.html` render prominent action banners; `user/reserve.html` disables step continuation until completed.

---

## 7. Automated Verification Protocol

Whenever changes are made, run the automated verification script from the project root:

```bash
node tools/verify_system.js
```

This performs 5 automated checks:
1. **PHP Syntax**: Runs `php -l` on all 47 PHP backend scripts.
2. **JavaScript Syntax**: Runs `node --check` on all 16 JavaScript scripts.
3. **API Client Cross-References**: Ensures all `DataAPI` and `Auth` methods match between `data.js`/`auth.js` and all caller scripts.
4. **HTML Asset Links**: Verifies all `<script src>` and `<link href>` tags across all HTML files resolve to existing files.
5. **Database Connectivity**: Validates live PDO connection to MySQL/MariaDB.
