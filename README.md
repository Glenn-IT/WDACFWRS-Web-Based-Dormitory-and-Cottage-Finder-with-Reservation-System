# WDACFWRS — Web-Based Dormitory and Cottage Finder with Reservation System

A dormitory and cottage booking platform for CSU-Piat: students browse and reserve
rooms/cottages, and admins manage listings, approvals, users, and reports.

Built with plain PHP + PDO (no framework) on a MySQL database, with a Bootstrap 5
frontend that talks to the backend through a small JSON API.

## Requirements

- XAMPP (Apache + MySQL + PHP 8+)
- A browser

## Setup

1. Place the project under your XAMPP `htdocs` folder (already done if you're
   reading this from there).
2. Start Apache and MySQL in the XAMPP control panel.
3. Import the database schema:
   ```
   mysql -u root < database/schema.sql
   ```
   This creates the `wdacfwrs_db` database, all tables, and seeds **one** admin
   account.
4. Confirm `config/database.php` matches your MySQL credentials (defaults to
   XAMPP's `root` user with no password).
5. Serve the site as a vhost, e.g. `http://wdac.local/` (see `httpd-vhosts.conf`
   and your `hosts` file), or via `http://localhost/WDACFWRS-.../`.

### Default admin login

- Email: `admin@csupiat.edu.ph`
- Password: `Admin@123`

Change this password after first login (Admin → Settings → Change Password).

## Project structure

```
api/            JSON API endpoints (PHP + PDO), one folder per resource area
config/         Database connection config
database/       schema.sql — full schema + admin seed
assets/js/      Frontend: DataAPI (data.js) and Auth (auth.js) fetch clients,
                plus one script per page (admin-*.js, user-*.js)
assets/css/     Styles
assets/uploads/ Uploaded dorm/cottage/profile images
admin/          Admin-facing pages
user/           Student-facing pages
partials/       Shared sidebar/topbar HTML fragments
docs/           Development checklist / progress notes
```

## Architecture

- **Database**: MySQL `wdacfwrs_db`. Core tables: `admins`, `students`,
  `dormitories`, `cottages`, `reservations` (+ `reservation_parent_info`,
  `reservation_backgrounds`), `payments`, `notifications`.
- **API**: `/api/<area>/<action>.php`, each including `api/_bootstrap.php` for
  session handling, JSON I/O helpers, and role checks.
- **Auth**: native PHP sessions; passwords and security-question answers are
  hashed with `password_hash`/`password_verify`.
- **Uploads**: validated (mime/size) and saved under `assets/uploads/`, with the
  relative path stored in the database.
- **Reservations**: creation is transactional — availability is re-checked with
  `SELECT ... FOR UPDATE` inside a PDO transaction to prevent double-booking.
- **Frontend**: `assets/js/data.js` (`DataAPI`) and `assets/js/auth.js` (`Auth`)
  are async fetch-based clients consumed by the per-page scripts.

See `docs/DEVELOPMENT_CHECKLIST.md` for the phase-by-phase build log.
