# WDACFWRS — Capstone Defense Presentation Walkthrough & Panelist Demonstration Guide
<!-- System: Web-Based Dormitory and Cottage Finder with Reservation System (WDACFWRS) -->
<!-- Institution: Cagayan State University - Piat Campus (CSU-Piat) -->
<!-- Target Audience: Capstone Defense Panelists, Advisers, Deans, and Evaluators -->

---

## 🧭 Executive Summary & Timing Strategy

| Phase | Section | Recommended Duration | Primary Interface |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Project Rationale, Campus Context & Institutional Problem Statement | 1.5 mins | Title Slide / [index.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/index.html) |
| **Phase 2** | Technical Architecture, Design System & Defensive Security Baseline | 1.0 min | [SYSTEM_MEMORY.md](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/SYSTEM_MEMORY.md) / [api/_bootstrap.php](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/api/_bootstrap.php) |
| **Phase 3** | Public Discovery Gateway & Guest Accommodation Explorer | 1.0 min | [guest.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/guest.html) |
| **Phase 4** | Student Onboarding, Academic Profiling & Security Question Trapping | 1.0 min | [register.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/register.html) & [forgot-password.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/forgot-password.html) |
| **Phase 5** | Student Command Dashboard & Real-Time Housing Status | 1.0 min | [user/dashboard.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/dashboard.html) |
| **Phase 6** | Interactive Unit Catalog, Gender Segregation & Live Filtering | 1.5 mins | [user/rooms.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/rooms.html) |
| **Phase 7** | 3-Step Reservation Wizard, Profile Pre-fill & Concurrency Protection | 2.0 mins | [user/reserve.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/reserve.html) |
| **Phase 8** | Tenant Background Capture & Emergency Guardian Archiving | 1.0 min | [user/reserve.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/reserve.html) & [user/profile.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/profile.html) |
| **Phase 9** | Reservation Lifecycle Tracking & Student Self-Service Cancellation | 1.0 min | [user/my-reservations.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/my-reservations.html) |
| **Phase 10** | Printable Official Reservation Slip Generation (Student View) | 1.0 min | [user/my-reservations.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/my-reservations.html) |
| **Phase 11** | In-App Transactional Notification Pipeline & Real-Time Alerts | 0.5 min | [assets/js/layout.js](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/assets/js/layout.js) & Topbar Bell |
| **Phase 12** | Administrator Command Center & Occupancy KPIs (Chart.js Analytics) | 1.0 min | [admin/dashboard.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/dashboard.html) |
| **Phase 13** | Dormitory & Cottage Asset Management (CRUD & Owner Profiles) | 1.0 min | [admin/dormitories.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/dormitories.html) & [admin/cottages.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/cottages.html) |
| **Phase 14** | Reservation Triage, Tenant Background Inspection & Adjudication | 1.5 mins | [admin/reservations.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/reservations.html) |
| **Phase 15** | Student User Governance & Account Status Controls | 0.5 min | [admin/users.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/users.html) |
| **Phase 16** | Institutional Housing Reports with Custom Signatories & PDF Export | 1.0 min | [admin/reports.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/reports.html) |
| **Phase 17** | Administrative Security & Credential Governance | 0.5 min | [admin/settings.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/settings.html) |
| **Phase 18** | Automated System Verification, Conclusion & Transition to Panel Q&A | 0.5 min | [tools/verify_system.js](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/tools/verify_system.js) |
| **Total** | **Full System Defense Presentation** | **~18.0 mins** | — |

---

## 🛠️ Pre-Defense Staging & Credentials Setup

Before starting the defense presentation, prepare your demonstration workstation:

1. **Browser Setup**:
   * **Window 1 (Main Browser):** Logged in as **University Housing Administrator** at [`admin/dashboard.html`](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/dashboard.html).
   * **Window 2 (Incognito / Private Window):** Ready for the **Student** live demonstration. This eliminates login/logout session collisions and allows instant cross-window verification when an application is reserved or approved.
2. **Standard Demonstration Accounts**:
   * **Admin Account:** `admin@csupiat.edu.ph` | Password: `Admin@123` | Security Question Answer: `reyes`
   * **Seeded Student Accounts:** Default Password: `sample123` | Security Answer: `sample`
3. **Database Seed Setup**:
   * Ensure database schema is synchronized via [`database/schema.sql`](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/database/schema.sql) and rich sample data populated via [`database/seed_sample_data.php`](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/database/seed_sample_data.php).
4. **Automated Verification Validation**:
   * Confirm all integrity tests pass by running: `node tools/verify_system.js` in terminal.

### 👥 Seeded Demonstration Accounts

| # | Name | Student No. | Email (`sample123`) | Program & Year | Contact Phone | Assigned Unit | Reservation Status |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **System Admin** | `ADMIN-01` | `admin@csupiat.edu.ph` | Campus Auxiliary & Housing Admin | `(078) 844-0000` | Campus Housing HQ | **Administrator** |
| 2 | **Maria Clara De Los Santos** | `STU-0001` | `maria.delossantos@gmail.com` | BS Information Technology, 2nd Yr | `09171234501` | Sampaguita Hall Room 101 | **Approved / Paid (GCash)** |
| 3 | **Angelo Bautista** | `STU-0002` | `angelo.bautista@gmail.com` | BS Agriculture, 3rd Yr | `09171234502` | Narra Hall Room 204 | **Approved / Paid (Cash)** |
| 4 | **Beatriz Mendoza** | `STU-0003` | `beatriz.mendoza@gmail.com` | BS Hospitality Mgmt, 1st Yr | `09171234503` | Pine Breeze Cottage | **Approved / Paid (Maya)** |
| 5 | **Christian Navarro** | `STU-0004` | `christian.navarro@gmail.com` | BS Criminology, 4th Yr | `09171234504` | Ipil Hall Room 302 | **Pending / Unpaid (Ready for Triage Demo)** |
| 6 | **Diana Rose Villanueva** | `STU-0005` | `diana.villanueva@gmail.com` | B. Elementary Education, 2nd Yr | `09171234505` | Garden View Cottage B | **Approved / Paid (GCash)** |

### 🏢 Seeded Accommodation Inventory

| Unit Name | Unit Type | Allocation / Owner | Capacity / Rooms | Monthly Rate | Live Status | Key Amenities |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Sampaguita Hall Room 101** | Dormitory | Female Only | 4 Occupants | ₱1,200.00 / mo | `Occupied` | Near study lounge, air conditioning, private study desks |
| **Narra Hall Room 204** | Dormitory | Male Only | 2 Occupants | ₱1,500.00 / mo | `Occupied` | 2nd floor quiet room, private bath, balcony |
| **Ipil Hall Room 302** | Dormitory | Female Only | 2 Occupants | ₱1,800.00 / mo | `Occupied` | Fully furnished double deck bed, built-in closets, Wi-Fi |
| **Yakal Hall Room 105** | Dormitory | Male Only | 4 Occupants | ₱1,000.00 / mo | `Available` | Standard 4-bed dorm room, study area, shared lounge |
| **Pine Breeze Cottage** | Cottage | CSU Auxiliary Services | 2 Rooms | ₱2,200.00 / mo | `Booked` | Duplex cottage, kitchen amenities, garden scenery |
| **Garden View Cottage B** | Cottage | Maria Fernandez | 1 Room | ₱1,600.00 / mo | `Booked` | Single-room peaceful cottage, private garden view |
| **Sunrise Haven Cottage** | Cottage | CSU Housing Office | 3 Rooms | ₱3,000.00 / mo | `Available` | Large family-style cottage, 3 bedrooms, living area, porch |

---

## 🎬 Step-by-Step Presentation Script (From First to Last)

---

### Step 1: Project Rationale, Campus Context & Institutional Problem Statement
* **Screen Display:** Title Slide or [index.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/index.html)
* **Estimated Time:** 1.5 minutes
* **Screen Action:** Present the landing page showcasing the university housing portal with branding for Cagayan State University - Piat Campus.
* **🗣️ Verbal Script:**
  > *"Good morning, honorable panel members, project advisers, and guests. Today, we are proud to present **WDACFWRS — the Web-Based Dormitory and Cottage Finder with Reservation System** for Cagayan State University - Piat Campus.
  >
  > *CSU-Piat is situated in a rural agricultural municipality serving thousands of students from all over Cagayan, Kalinga, Apayao, and neighboring provinces. Because many students travel hours from distant hometowns, secure on-campus dormitories and accredited university cottages are critical to their academic success and safety.
  >
  > *Historically, housing placement was plagued by manual paper forms, physical queues during enrollment week, lack of transparency regarding room vacancy and gender allocation, and scattered tenant records. Crucial medical details, parent emergency contacts, and appliance disclosures were often lost in physical folders.
  >
  > *WDACFWRS solves this by creating a unified, automated, and secure digital platform that connects students, dorm managers, and university administration in real time."*

---

### Step 2: Technical Architecture, Design System & Defensive Security Baseline
* **Screen Display:** Architecture Diagram or [SYSTEM_MEMORY.md](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/SYSTEM_MEMORY.md) / [api/_bootstrap.php](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/api/_bootstrap.php)
* **Estimated Time:** 1.0 minute
* **Screen Action:** Highlight the clean software architecture, database design, and defensive engineering principles.
* **🗣️ Verbal Script:**
  > *"Under the hood, WDACFWRS is engineered on a lightweight, enterprise-ready software stack:
  >
  > 1. **Modular Backend & Database:** Pure PHP 8.2+ RESTful architecture interacting with MariaDB/MySQL (`wdacfwrs_db`) via strict PDO prepared statements, completely neutralizing SQL injection risks.
  > 2. **ACID Transaction Safety:** Crucial operations like booking employ explicit PDO transactions (`$pdo->beginTransaction()`) and pessimistic locking (`SELECT ... FOR UPDATE`) in [api/reservations/create.php](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/api/reservations/create.php), preventing double-booking race conditions when multiple students select the same unit simultaneously.
  > 3. **Defensive Session & Role Isolation:** Protected session cookies (`WDACFWRS_SESSID`, `HttpOnly`, `SameSite=Lax`), bcrypt password hashing (`PASSWORD_DEFAULT`), and strict server-side role validation (`require_role('admin')` or `require_role('student')`).
  > 4. **Unified Warm Orange Design System:** A cohesive, modern design system built with Bootstrap 5.3.3 and custom CSS variables (`assets/css/style.css`), providing high visual hierarchy and responsive mobile-first usability without external build tools.
  > 5. **Self-Healing Verification Protocol:** A dedicated automated verification suite ([tools/verify_system.js](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/tools/verify_system.js)) that checks PHP syntax, JavaScript validity, API contracts, and database health with zero runtime dependencies."*

---

### Step 3: Public Discovery Gateway & Guest Accommodation Explorer
* **Screen Display:** [guest.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/guest.html)
* **Estimated Time:** 1.0 minute
* **Screen Action:**
  1. Access the portal as an unauthenticated guest.
  2. Point out that incoming freshmen and visiting guardians can freely browse available university dormitories and cottages without registering an account upfront.
  3. Filter by Unit Type (Dormitories / Cottages), Gender (Male / Female), and Availability.
  4. Click **"View Details"** on *Yakal Hall Room 105* to display amenities, capacity, and rate.
  5. Click **"Reserve Unit"** to demonstrate how guests are seamlessly prompted to sign in or create a student account.
* **🗣️ Verbal Script:**
  > *"Before arriving on campus, prospective freshmen and parents need to know what accommodations exist. In our **Public Guest Explorer**, visitors can search all university housing, inspect room amenities, check prices, and verify gender allocation with zero login friction.
  >
  > *If a guest attempts to book, the system gracefully directs them to register with their verified student credentials, ensuring institutional safety."*

---

### Step 4: Student Onboarding, Academic Profiling & Security Question Trapping
* **Screen Display:** [register.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/register.html) & [forgot-password.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/forgot-password.html)
* **Estimated Time:** 1.0 minute
* **Screen Action:**
  1. Showcase the registration form: Student Number (`STU-XXXX`), Course/Program, Year Level, Current Semester, and Philippine mobile number formatting (`09XXXXXXXXX`).
  2. Highlight the password policy validator enforcing minimum 6 alphanumeric characters.
  3. Point out the mandatory Security Question selector used for self-service account recovery.
  4. Briefly switch to `forgot-password.html` to show the 3-step password reset workflow (Lookup -> Verify Question -> Reset Password).
* **🗣️ Verbal Script:**
  > *"Our student registration collects academic identifiers along with emergency contact numbers and security questions.
  >
  > *Students maintain autonomous self-service password recovery via `forgot-password.html`, relieving administrative personnel of manual password reset requests during peak admission periods."*

---

### Step 5: Student Command Dashboard & Real-Time Housing Status
* **Screen Display:** Log in as `maria.delossantos@gmail.com` in Window 2 -> [user/dashboard.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/dashboard.html)
* **Estimated Time:** 1.0 minute
* **Screen Action:**
  1. Showcase the dynamic Student Command Dashboard.
  2. Highlight the top **"Active Reservation"** alert banner displaying her confirmed room (*Sampaguita Hall Room 101*), payment status (`Paid via GCash`), and approval badge.
  3. Point out the quick KPI cards: *Available Dorms, Available Cottages, and Active Bookings*.
  4. Showcase the quick-action shortcut buttons and preview list of other campus housing units.
* **🗣️ Verbal Script:**
  > *"Once logged in, the student enters their personal housing dashboard. If they have an active or pending reservation, an alert banner displays room assignment, payment status, and administrative approval status.
  >
  > *Students immediately know where their accommodation stands, eliminating anxiety and unnecessary visits to the Housing Office."*

---

### Step 6: Interactive Unit Catalog, Gender Segregation & Live Filtering
* **Screen Display:** [user/rooms.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/rooms.html)
* **Estimated Time:** 1.5 minutes
* **Screen Action:**
  1. Navigate to **"Browse Units"**.
  2. Switch between the **Dormitories** tab and the **Cottages** tab.
  3. Test the live text search (e.g., type `Narra` or `Pine`).
  4. Toggle Gender filters (`Male`, `Female`) and Status filters (`Available`, `Occupied`).
  5. Open a Cottage card (e.g., *Pine Breeze Cottage*) and click **"View Details"**:
     * Showcase the dedicated **Cottage Owner / Caretaker Profile Card** (Caretaker name, photo, phone, email, and property description).
* **🗣️ Verbal Script:**
  > *"In the Accommodation Catalog, students can toggle between on-campus dormitories and university cottages.
  >
  > *Dormitories enforce strict gender segregation to adhere to campus residential policies. For cottages, students can view the full profile and contact details of the cottage manager or caretaker, providing complete transparency before booking."*

---

### Step 7: 3-Step Reservation Wizard, Profile Pre-fill & Concurrency Protection
* **Screen Display:** [user/reserve.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/reserve.html)
* **Estimated Time:** 2.0 minutes
* **Screen Action:**
  1. Open the Reservation Wizard:
     * Note: If logged in as Maria (who already holds an approved unit), show the system guard alert: *"You already have an active approved reservation. Only one active booking is permitted."*
     * Log in as a fresh student or use Christian Navarro / create a new reservation to show the full wizard.
  2. **Step 1: Accommodation Selection** — Select an available unit (e.g., *Yakal Hall Room 105*). Show the dynamic preview badge displaying capacity, monthly rate, and gender designation. Click *Continue to Step 2*.
  3. **Step 2: Parent & Guardian Emergency Contact** — Point out how the student's profile information automatically pre-fills the form (Father/Mother name, occupation, address, emergency contact person, relationship, and phone number). Click *Continue to Step 3*.
  4. **Step 3: Background, Lifestyle & Payment Details** —
     * Review the student lifestyle checklist: electrical appliances brought (laptop, fan, iron), reason for accommodation, medical conditions/allergies, smoking/drinking status, student organizations, and hobbies.
     * Select Payment Method: `Cash`, `GCash`, or `Maya`.
     * Pick scheduled move-in/reservation date.
     * Click **"Submit Reservation"**.
* **🗣️ Verbal Script:**
  > *"Our primary student innovation is the **3-Step Reservation Wizard**:
  >
  > *In Step 1, students choose their desired unit with live rate and capacity tracking.
  >
  > *In Steps 2 and 3, our intelligent auto-fill engine pulls existing parent emergency contacts and lifestyle information directly from their student profile. Students do not need to retype repetitive data every semester.
  >
  > *Crucially, on submission, the backend locks the database row with `SELECT ... FOR UPDATE` inside a PDO transaction. The asset status immediately flips to prevent double-booking, and an immutable snapshot of their background is bound to this reservation ID."*

---

### Step 8: Tenant Background Capture & Emergency Guardian Archiving
* **Screen Display:** [user/profile.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/profile.html) (Emergency & Background Tabs)
* **Estimated Time:** 1.0 minute
* **Screen Action:**
  1. Open the student's profile page.
  2. Inspect the **Personal & Academic Information** tab (Student ID, Course, Year Level). Note that student legal names are immutable to prevent identity tampering.
  3. Inspect the **Parent & Emergency Contact** tab.
  4. Inspect the **Lifestyle & Background** tab (medical history, electrical appliances declared for campus safety).
  5. Demonstrate profile avatar upload with live client-side preview.
* **🗣️ Verbal Script:**
  > *"Campus dormitories must ensure the safety and welfare of every resident.
  >
  > *Through the Tenant Background system, the housing administration knows which students have medical conditions like asthma or allergies, who to call immediately in emergencies, and what electrical appliances are inside rooms to prevent electrical hazards and circuit overloads."*

---

### Step 9: Reservation Lifecycle Tracking & Student Self-Service Cancellation
* **Screen Display:** [user/my-reservations.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/my-reservations.html)
* **Estimated Time:** 1.0 minute
* **Screen Action:**
  1. Navigate to **"My Reservations"**.
  2. Point out the reservation card showing unit name, date submitted, payment status pill, and approval status badge (`Pending`, `Approved`, `Declined`, `Cancelled`).
  3. Demonstrate the **"Cancel Reservation"** button on pending or approved bookings:
     * Click Cancel and confirm the confirmation modal.
     * Explain how the backend transaction immediately sets status to `Cancelled` and reverts the dormitory or cottage back to `Available` in real time so other students can reserve it.
* **🗣️ Verbal Script:**
  > *"Under 'My Reservations', students track their reservation history in real time.
  >
  > *If a student's plans change, they can cancel their booking directly through the interface. The system automatically releases the room back into the available inventory pool immediately, eliminating administrative delays and ghost bookings."*

---

### Step 10: Printable Official Reservation Slip Generation (Student View)
* **Screen Display:** [user/my-reservations.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/my-reservations.html) -> Click **"Print Slip"**
* **Estimated Time:** 1.0 minute
* **Screen Action:**
  1. Click the **"Print Slip"** button on an approved reservation card.
  2. Showcase the formatted print modal and browser print preview:
     * Institutional header: *Cagayan State University - Piat Campus, Office of Student Auxiliary Services*.
     * Official Reservation Control Number, Student Academic Details, Assigned Unit, Payment Breakdown, and Parent Emergency Contact.
     * Resident and Dormitory Manager signature fields ready for physical check-in submission.
* **🗣️ Verbal Script:**
  > *"When a reservation is approved, students do not need to wait for a manual certificate. With one click, WDACFWRS generates a standardized, printable **Official Accommodation Reservation Slip**.
  >
  > *This slip serves as their formal admission voucher presented to dorm matrons or cottage caretakers upon moving into the campus."*

---

### Step 11: In-App Transactional Notification Pipeline & Real-Time Alerts
* **Screen Display:** Topbar bell icon in [user/dashboard.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/dashboard.html) / [assets/js/layout.js](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/assets/js/layout.js)
* **Estimated Time:** 0.5 minute
* **Screen Action:**
  1. Click on the notification bell in the top navigation bar.
  2. Show recent automated alerts (e.g., *"Your reservation for Narra Hall Room 204 has been Approved by the Administrator"*).
  3. Click **"Mark all as read"** to demonstrate real-time unread badge counter reduction.
* **🗣️ Verbal Script:**
  > *"Whenever an administrator approves, declines, or edits a booking, our notification pipeline dispatches an in-app alert directly to the student's topbar with live unread indicators, ensuring tenants stay informed without constant manual refreshing."*

---

### Step 12: Administrator Command Center & Occupancy KPIs (Chart.js Analytics)
* **Screen Display:** Switch to Window 1: [admin/dashboard.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/dashboard.html)
* **Estimated Time:** 1.0 minute
* **Screen Action:**
  1. Present the Admin Executive Command Center.
  2. Highlight the KPI metric tiles: *Total Registered Students, Total Dormitories, Total Cottages, Active Reservations, Monthly Revenue (₱), and Pending Approvals*.
  3. Showcase the live Chart.js visual charts:
     * **Unit Occupancy Breakdown:** Visual donut/pie chart comparing Available vs. Occupied vs. Full accommodations.
     * **Monthly Reservation Trends:** Line/Bar chart illustrating reservation volume throughout the academic semester.
     * **Revenue Analytics:** Income generated across cash, GCash, and Maya payment methods.
* **🗣️ Verbal Script:**
  > *"Now switching to Window 1: the University Housing Administrator portal.
  >
  > *The Admin Dashboard serves as an executive command center. Campus directors and housing administrators get an instantaneous snapshot of total bed occupancy, pending applicant volume, and overall revenue collected across payment channels."*

---

### Step 13: Dormitory & Cottage Asset Management (CRUD & Owner Profiles)
* **Screen Display:** [admin/dormitories.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/dormitories.html) & [admin/cottages.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/cottages.html)
* **Estimated Time:** 1.0 minute
* **Screen Action:**
  1. Open **Dormitories Management**:
     * Demonstrate filtering by Gender (`Male`, `Female`) and Status (`Available`, `Occupied`, `Full`).
     * Click **"Add Dormitory"** to reveal the modal: Room Number, Gender assignment, Capacity, Monthly Price, Description, and Image Upload.
  2. Open **Cottages Management**:
     * Showcase the cottage inventory table.
     * Open the **"Add / Edit Cottage"** modal to demonstrate managing the **Cottage Owner / Caretaker** fields: Owner Name, Contact Phone, Email, Caretaker Bio, and Photo.
* **🗣️ Verbal Script:**
  > *"Administrators have complete control over university housing assets.
  >
  > *For dormitories, rooms are categorized by gender and capacity. For cottages, administrators maintain caretaker information so students always have reliable contacts for check-in and maintenance inquiries."*

---

### Step 14: Reservation Triage, Tenant Background Inspection & Adjudication
* **Screen Display:** [admin/reservations.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/reservations.html)
* **Estimated Time:** 1.5 minutes
* **Screen Action:**
  1. Filter reservations by `Pending` to view Christian Navarro's booking for *Ipil Hall Room 302*.
  2. Click **"View Details"** to open the comprehensive reservation dossier:
     * Inspect student academic details, chosen payment method, parent/guardian emergency contact, and declared student background (medical conditions, appliances, reason for stay).
  3. Click **"Approve"**:
     * Point out how the approval updates the status, dispatches a student notification, and locks the room as `Occupied`.
  4. Demonstrate the **"Edit Reservation"** modal (adjusting dates or payment status).
  5. Demonstrate **"Print Slip"** from the admin side to produce an official university check-in voucher.
* **🗣️ Verbal Script:**
  > *"In the Reservation Management module, administrators adjudicate applications with full context.
  >
  > *Before approving a room, the administrator reviews the student's declared background, parent contact, and payment status in one comprehensive modal.
  >
  > *When approved, the unit status is updated, and the student's account is instantly notified."*

---

### Step 15: Student User Governance & Account Status Controls
* **Screen Display:** [admin/users.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/users.html)
* **Estimated Time:** 0.5 minute
* **Screen Action:**
  1. Display the Student Directory table: Student Number, Full Name, Program, Year Level, Contact Number, and Registration Date.
  2. Click **"View Details"** on a student to see their complete profile including parent/guardian information and emergency contacts.
  3. Point out the **Account Status Toggle** (`Active` / `Inactive`) which allows administrators to suspend accounts for graduating students or policy violators.
* **🗣️ Verbal Script:**
  > *"The User Management module centralizes student records. Housing administrators can inspect complete tenant files or deactivate accounts of graduating or suspended students to preserve campus security."*

---

### Step 16: Institutional Housing Reports with Custom Signatories & PDF Export
* **Screen Display:** [admin/reports.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/reports.html)
* **Estimated Time:** 1.0 minute
* **Screen Action:**
  1. Select Report Type from the dropdown:
     * *Reservation Summary Report*
     * *Dormitory Occupancy & Capacity Report*
     * *Cottage Utilization Report*
     * *Housing Revenue & Payment Collection Report*
     * *Student Registration Roster*
  2. Select Date Range (e.g., current semester) and click **"Generate Report"**.
  3. Point out the **Official Signatories Configuration Card**:
     * Customize **'Prepared By'** (e.g., *Campus Housing Officer / Matron*)
     * Customize **'Approved By'** (e.g., *Campus Executive Officer / Dean of Student Affairs*).
  4. Showcase the generated printable document featuring the official header of **Cagayan State University - Piat Campus**.
  5. Click **"Print Report / Save as PDF"** to display the print-ready layout.
* **🗣️ Verbal Script:**
  > *"For university audits, academic council presentations, and auxiliary budgeting, WDACFWRS generates official administrative reports.
  >
  > *Administrators can filter by semester and customize executive signatories — such as the Housing Officer and Campus Executive Officer — before printing or exporting clean, audit-compliant PDF documents."*

---

### Step 17: Administrative Security & Credential Governance
* **Screen Display:** [admin/settings.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/settings.html)
* **Estimated Time:** 0.5 minute
* **Screen Action:**
  1. Navigate to Admin Settings.
  2. Showcase the **Profile Tab** (Admin name, email).
  3. Showcase the **Security Question Tab** (Updating hashed security answers for self-service recovery).
  4. Showcase the **Password Tab** (Enforcing secure credential updates).
* **🗣️ Verbal Script:**
  > *"Administrative settings allow housing officers to maintain their credentials, update security recovery questions, and enforce strong password policies, ensuring that access to sensitive student records remains protected."*

---

### Step 18: Automated System Verification, Conclusion & Transition to Panel Q&A
* **Screen Display:** Terminal running `node tools/verify_system.js` or [tools/verify_system.js](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/tools/verify_system.js)
* **Estimated Time:** 0.5 minute
* **Screen Action:**
  1. Show terminal output of the automated verification tool passing all 5 integrity layers (48 PHP files, 17 JS files, 32 API endpoints, 21 HTML views, and Database connectivity).
  2. Deliver concluding remarks and open the floor to panelists.
* **🗣️ Verbal Script:**
  > *"To ensure maximum stability and zero runtime errors, we developed an automated test suite verifying all 48 backend endpoints, 17 frontend scripts, and database connections. Every check passes cleanly with zero warnings.
  >
  > *In conclusion, WDACFWRS transforms accommodation management at CSU-Piat from a chaotic, paper-bound process into a transparent, secure, and student-centered digital ecosystem.
  >
  > *Thank you very much, honorable members of the panel. We are now eager and ready to entertain your questions."*

---

## 🛡️ Capstone Defense Panelist Q&A Cheat Sheet

| Question | Recommended Technical & Institutional Answer |
| :--- | :--- |
| **Q1: Why build a custom web system when dormitories could simply use Google Forms, Excel sheets, or Facebook Groups?** | *"Google Forms and Excel lack **relational integrity, automated concurrency control, and real-time inventory management**. Multiple students can fill out a Google Form for the same bed at the same time, creating embarrassing double-bookings that must be resolved manually. Furthermore, spreadsheet rows cannot enforce role-based access control, cannot generate official signed printable reservation vouchers, and expose sensitive student medical and guardian data. WDACFWRS provides an integrated, role-protected ecosystem with instant status synchronization, automated capacity tracking, and institutional reporting."* |
| **Q2: How does the system prevent double-booking or race conditions when two students click 'Reserve' at the exact same second?** | *"In [api/reservations/create.php](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/api/reservations/create.php), reservation processing is enclosed within an **ACID-compliant PDO transaction** (`$pdo->beginTransaction()`). We execute a pessimistic row lock using `SELECT status/availability FROM dormitories/cottages WHERE id = ? FOR UPDATE`. If student A's query arrives milliseconds ahead, student B's transaction waits until the row is evaluated. When student A's reservation succeeds, the asset status flips to `Occupied` or `Booked`, causing student B's transaction to fail the availability check and return a clean JSON error response: `'This unit is no longer available.'`"* |
| **Q3: Why allow guests to view rooms without logging in if reservations require student accounts?** | *"Entering university is a high-stress transition where incoming freshmen, transferees, and parents need to survey housing options, evaluate room rates, and check gender policies before completing formal enrollment. Our **Guest Explorer** ([guest.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/guest.html)) provides public marketing visibility for university housing while strictly gating the transactional booking process behind verified student accounts ([register.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/register.html))."* |
| **Q4: Why are student lifestyle backgrounds and parent emergency contacts snapshotted into separate reservation tables?** | *"In our schema ([database/schema.sql](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/database/schema.sql)), we maintain both `student_parent_info` / `student_backgrounds` on the student profile AND `reservation_parent_info` / `reservation_backgrounds` on each reservation. This provides **point-in-time historical immutability**: if a student moves to a new room next semester or updates their contact number later, the historical reservation slip from their first year retains the exact emergency contact, medical declaration, and electrical appliances reported during that specific term for legal auditability."* |
| **Q5: Can a student book multiple dorms or cottages simultaneously to hoard rooms?** | *"No. The system strictly enforces a **single active approved reservation rule**. In [api/reservations/create.php](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/api/reservations/create.php) and [user/reserve.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/reserve.html), before a reservation can proceed, the backend queries for any existing reservation belonging to `$_SESSION['user']['id']` with `approval_status = 'Approved'`. If an approved booking exists, new reservations are locked out until the current reservation is cancelled or concluded."* |
| **Q6: How do you prevent SQL injection, cross-site scripting (XSS), and privilege escalation?** | *"We employ defense-in-depth across the entire stack: (1) **100% Parameterized PDO queries** in [config/database.php](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/config/database.php) ensure user input is never concatenated directly into SQL; (2) Passwords use standard bcrypt hashing via `password_hash(..., PASSWORD_DEFAULT)`; (3) Role enforcement is executed server-side via `require_role('admin')` or `require_role('student')` in [api/_bootstrap.php](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/api/_bootstrap.php); (4) Student data endpoints always filter by `$_SESSION['user']['id']`, completely ignoring client-supplied tampering IDs."* |
| **Q7: What happens if an applicant attempts to upload a malicious PHP script disguised as an image?** | *"In [api/_uploads.php](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/api/_uploads.php), file uploads are protected by multiple strict validations: (1) Validating file extension against an allowed whitelist (`jpg`, `jpeg`, `png`, `webp`); (2) Verifying the true MIME type using PHP `finfo` (`image/jpeg`, `image/png`, `image/webp`); (3) Enforcing a 5MB size limit; (4) Renaming the uploaded file to a cryptographically unique 32-character hexadecimal MD5 hash, stripping any attacker-controlled filename; and (5) Storing uploads in an isolated directory where script execution can be disabled via `.htaccess`."* |
| **Q8: How does the system handle cancellations and declined reservations?** | *"When an administrator declines a reservation in [api/reservations/decline.php](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/api/reservations/decline.php) or a student cancels their pending booking in [api/reservations/cancel.php](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/api/reservations/cancel.php), the transaction automatically updates the reservation's `approval_status` to `'Declined'` or `'Cancelled'` and simultaneously reverts the linked dormitory or cottage status back to `'Available'`. An in-app alert is generated so the student receives immediate feedback."* |
| **Q9: How are official university signatories configured for institutional reports?** | *"In [admin/reports.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/reports.html) and [assets/js/admin-reports.js](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/assets/js/admin-reports.js), administrators have a dedicated **Signatories Configuration** interface. They can customize the names and official administrative titles for both 'Prepared By' (e.g. *Dormitory Matron / Housing Officer*) and 'Approved By' (e.g. *Campus Executive Officer / Dean of Student Affairs*). These details are dynamically rendered onto all official printable reports and PDF exports."* |
| **Q10: How scalable is this system if other CSU campuses (e.g., Andrews, Carig, Sanchez Mira) want to adopt it?** | *"Because our architecture cleanly separates API endpoints, data models, and decoupled frontend JavaScript controllers, scaling to other campuses is straightforward. The database schema supports campus partitioning or multi-campus tenanting simply by adding a `campus_id` foreign key to dormitories and cottages, reusing 100% of the core reservation logic."* |

---

## 💡 Pro-Tips for Defense Day

1. **Dual-Browser Live Demonstration:**
   * Open **Google Chrome** on the left half of the screen logged in as **Admin** ([`admin/dashboard.html`](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/dashboard.html)).
   * Open **Chrome Incognito / Firefox** on the right half logged in as **Student Christian Navarro** ([`user/my-reservations.html`](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/my-reservations.html)).
   * Click **"Approve"** on the Admin screen on the left, then immediately refresh or view the Student screen on the right: point out how the status badge changes from yellow `Pending` to green `Approved`, the room status flips, and the in-app notification bell counter updates. Panels love seeing real-time synchronization in action!
2. **Highlight Local CSU-Piat Grounding:**
   * Reference real campus contexts: Mention students traveling from remote barangays in Piat, Solana, Enrile, Tuao, and neighboring Kalinga/Apayao provinces who rely on on-campus dormitories (Sampaguita, Narra, Ipil, Yakal) and local cottages.
3. **Showcase the Printable Documents:**
   * Demonstrate both the **Official Reservation Slip** ([user/my-reservations.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/user/my-reservations.html)) and the **Institutional Housing Report with Executive Signatories** ([admin/reports.html](file:///C:/xampp/htdocs/WDACFWRS-Web-Based-Dormitory-and-Cottage-Finder-with-Reservation-System/admin/reports.html)). Academic panelists appreciate clean, print-ready bureaucratic forms tailored for university administration.
4. **Demonstrate Automated Code Quality:**
   * If a technical panelist inquires about code quality or test coverage, open your terminal and run `node tools/verify_system.js`. Showing 48 PHP files, 17 JS files, 32 API endpoints, and database connectivity all passing with zero errors provides undeniable proof of engineering rigor.
5. **Ensure Offline Readiness:**
   * Keep your local Apache and MySQL running via XAMPP. Because the application uses self-contained Bootstrap and vanilla JS assets with zero heavy build steps, your entire defense presentation can be delivered flawlessly even if campus internet fails.
