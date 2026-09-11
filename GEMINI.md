# WDACFWRS — Agent Rules & Synchronization Directives

## Master System Memory Reference
Before making any changes or additions to this codebase, **always read and adhere to `SYSTEM_MEMORY.md`**.

## Mandatory Change Synchronization Protocol
Whenever any file or function in this project is updated, you **MUST** ensure all connected files and functions are synchronized across the entire stack:

1. **Database Changes**:
   - Update `database/schema.sql`.
   - Update helper mapping function in `api/<module>/_helpers.php`.
   - Update corresponding API endpoints in `api/<module>/`.
   - Update `assets/js/data.js` or `assets/js/auth.js`.
   - Update all corresponding HTML form fields and modal dialogs in `admin/` or `user/`.
   - Update JS controller scripts (`admin-*.js` or `user-*.js`).
   - If reporting/stats are affected, update `api/dashboard/admin_stats.php` and `api/reports/generate.php`.

2. **API Endpoint Changes**:
   - If modifying request/response parameters, update `assets/js/data.js` and all page scripts calling that method.
   - Maintain JSON response structure: `{ "ok": true, ... }` or `{ "ok": false, "message": "..." }`.
   - Ensure role security: `require_role('admin')` or `require_role('student')`.

3. **Frontend Changes**:
   - Maintain camelCase naming on JavaScript data objects.
   - For images, always use `resolveAsset(path)`.
   - Ensure form element IDs match what the corresponding JS event listeners target.

4. **Verification Requirement**:
   - After completing any modification, run:
     ```bash
     node tools/verify_system.js
     ```
   - Ensure all checks pass (PHP syntax, JS syntax, cross-references, HTML links, and DB connectivity).
