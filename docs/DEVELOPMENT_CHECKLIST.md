# WDACFWRS Backend Development Checklist

Tracks the migration from the localStorage mock prototype to a real PHP + MySQL
backend. See the architecture/schema notes below the checklist for reference.

## Phase 0 — Foundation
- [x] `database/schema.sql` — full MySQL schema + 1 seeded admin account
- [x] `config/database.php` — shared PDO connection
- [x] `api/_bootstrap.php` — session start, `respond()`, `fail()`, `json_input()`, `require_role()`, `require_post()`, `next_code()`
- [x] `assets/js/data.js` rewritten as a fetch-based `DataAPI` client (no more localStorage mock/seed data)
- [x] Import `database/schema.sql` into MySQL (via phpMyAdmin or `mysql` CLI) — **do this before testing any endpoint**

## Phase 1 — Auth  ✅ done, verified via curl (register/login/logout/session/forgot lookup+verify+reset)
- [x] `api/auth/register.php`
- [x] `api/auth/login.php`
- [x] `api/auth/logout.php`
- [x] `api/auth/session.php`
- [x] `api/auth/forgot_lookup.php`
- [x] `api/auth/forgot_verify.php` (added: verifies security answer without resetting, needed since answers can't be checked client-side anymore)
- [x] `api/auth/forgot_reset.php`
- [x] `assets/js/auth.js` rewritten to call the endpoints above (fetch-based, async)
- [x] `index.html`, `register.html`, `forgot-password.html` updated to `await` the new async `Auth`/`DataAPI` calls
- [x] `assets/js/layout.js` updated to `await Auth.requireRole()`; profile/notifications calls wrapped in try/catch until Phase 2/4 endpoints exist
- [x] `assets/js/ui.js` `withLoading()` made async (real request latency instead of a fake 400ms delay)

## Phase 2 — Dormitories & Cottages  ✅ done, verified via curl (CRUD + real image upload)
- [x] `api/dorms/{list,get,create,update,delete}.php` (create/update accept multipart image upload)
- [x] `api/cottages/{list,get,create,update,delete}.php`
- [x] `api/_uploads.php` shared image-upload validator/mover (mime/size checked, random filename)
- [x] `assets/js/admin-dormitories.js` rewired (FormData + async)
- [x] `assets/js/admin-cottages.js` rewired
- [x] `assets/js/user-rooms.js` rewired (search/filter via query params, server-side now)
- [x] `assets/js/user-dashboard.js` dorm/cottage preview rewired; reservations/notifications sections wrapped in try/catch until Phase 3/4 land
- [x] `assets/js/data.js`: added `resolveAsset()` + `SITE_ROOT` to build correct relative image URLs from any page depth
- [ ] `assets/js/user-reserve.js` asset lookup (step 1 display) — deferred to Phase 3 since the whole file's submit flow needs the reservations endpoint anyway

## Phase 3 — Reservations  ✅ done, verified via curl (full lifecycle: create→approve/decline→cancel, asset status flips confirmed)
- [x] `api/reservations/create.php` (transactional: `SELECT ... FOR UPDATE` availability re-check, insert reservation + parent_info + background + payment, flip asset status, create notification)
- [x] `api/reservations/list.php` (admin: all + filters; student: always own regardless of client params — enforced server-side)
- [x] `api/reservations/get.php`
- [x] `api/reservations/approve.php`
- [x] `api/reservations/decline.php` (also reverts asset to Available — fixes a gap in the original mock, which never freed the room on decline)
- [x] `api/reservations/cancel.php` (reverts asset status; only Pending/Approved cancellable)
- [x] `assets/js/user-reserve.js` wizard submit rewired (asset lookup via `DataAPI.getDorm/getCottage`, submit via `DataAPI.createReservation`)
- [x] `assets/js/user-reservations.js` list/cancel/print rewired
- [x] `assets/js/admin-reservations.js` list/filter/approve/decline/print rewired

## Phase 4 — Dashboard, Reports, Notifications  ✅ done, verified via curl
- [x] `api/dashboard/admin_stats.php` (totals, status/occupancy breakdowns, 6-month chart data, revenue — all SQL aggregates)
- [x] `api/reports/generate.php` (reservations, dorm-occupancy, cottage-occupancy, revenue, registrations)
- [x] `api/notifications/list.php`
- [x] `api/notifications/mark_read.php`
- [x] `assets/js/admin-dashboard.js` rewired to server aggregates
- [x] `assets/js/admin-reports.js` rewired
- [x] `assets/js/layout.js` notification dropdown rewired + click-to-mark-read wired up
- [x] `assets/js/ui.js`: `withLoading()` now returns the wrapped function's resolved value (needed by admin-reports.js)
- [ ] `api/dashboard/student_stats.php` — skipped: `user-dashboard.js` already gets everything it needs from `getReservations`/`getNotifications`/`getDorms`/`getCottages` directly, no separate aggregate endpoint was needed

## Phase 5 — Users, Profile, Settings  ✅ done, verified via curl
- [x] `api/users/list.php`, `api/users/set_status.php`, `api/users/get.php`
- [x] `api/profile/get.php`, `update.php`, `change_password.php`, `upload_picture.php`
- [x] `api/settings/get.php` (added: returns admin's own name/email/role/securityQuestion — needed since the security answer is hashed and can't be redisplayed)
- [x] `api/settings/profile.php`, `security.php`, `password.php`
- [x] `assets/js/admin-users.js` rewired
- [x] `assets/js/user-profile.js` rewired (real picture upload, hashed password change)
- [x] `assets/js/admin-settings.js` rewired; `admin/settings.html` security-answer field now says "Enter a new answer to update it" instead of prefilling the old plaintext answer

## Phase 6 — Cleanup & Verification  ✅ done
- [x] `grep -rn "localStorage\|seedAll\|FIRST_NAMES\|DB\.nextId\|DB\.KEYS" assets/js` returns nothing (only a comment mentions "localStorage" historically)
- [x] `grep -rn "saveDorms\|saveCottages\|saveUsers\|saveAdmins\|saveReservations\|savePayments\|saveNotifications\|Auth.setSession\|findAccountByEmail" assets/js` returns nothing — all old mock-mutation calls are gone
- [x] `node --check` passes on every file in `assets/js/`
- [x] Full end-to-end curl smoke test performed against the live XAMPP server (`wdac.local` vhost) covering: register → browse → reserve (dorm, GCash) → asset flips to Occupied → admin approves → student gets notification → second reservation (cottage, Cash) → student cancels → asset reverts to Available → admin dashboard stats and reservations report reflect the real rows. All steps passed.
- [x] Test data cleaned up afterward; database left with only the seeded admin account (`admin@csupiat.edu.ph` / `Admin@123`)
- [ ] **Not done: a real-browser click-through.** No `chromium-cli`/Playwright was available in this environment, so the UI itself (forms, modals, wizard steps) was not visually driven — only the API layer it calls. Recommend a manual pass in an actual browser before considering the frontend integration "seen working," or set up a project run-skill (`/run-skill-generator`) with Playwright for future automated UI checks.

## Manual smoke test (run once Phase 3 is done, repeat after Phase 5)
1. Register a new student account.
2. Log in as that student.
3. Browse dorms/cottages, filter/search.
4. Submit a reservation through all 5 wizard steps.
5. Confirm the dorm/cottage status flips (Available → Occupied/Booked) and a notification appears.
6. Log in as admin (`admin@csupiat.edu.ph` / `Admin@123` from the seed — change this password after first login).
7. See the new reservation, Approve it; confirm the student sees "Approved" + a notification.
8. Submit a second reservation as student, then Cancel it; confirm the asset reverts to Available.
9. Check the admin dashboard stats/charts and reports reflect real DB rows.
10. Upload a profile picture and a dorm/cottage image; confirm files land under `assets/uploads/` and render on the page.

---

## Architecture reference

- **DB**: MySQL `wdacfwrs_db`, schema in `database/schema.sql`.
- **Connection**: `config/database.php` (PDO, root/no password — default XAMPP).
- **API layer**: `/api/<area>/<action>.php`, each including `api/_bootstrap.php` for session/db/helpers.
- **Auth**: native PHP `$_SESSION`, `password_hash`/`password_verify` for both passwords and security-question answers.
- **Uploads**: `assets/uploads/{dorms,cottages,profiles}/`, path stored in DB, served directly as static files.
- **Frontend**: `assets/js/data.js` (`DataAPI`) and `assets/js/auth.js` (`Auth`) are fetch-based clients; other `assets/js/*.js` files call them and are updated per-phase as endpoints land.
