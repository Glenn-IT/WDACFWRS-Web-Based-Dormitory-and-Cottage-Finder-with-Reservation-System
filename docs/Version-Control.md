# Version Control — WDACFWRS

Week-by-week versioned presentation rollout for the Web-Based Dormitory and
Cottage Finder with Reservation System, using Git tags as permanent snapshots.

## Rollout Schedule

| Version | Feature | Pages Unlocked This Version | Pages Still Gated |
|---------|---------|------------------------------|--------------------|
| v1.00 | Login / Register (Admin/User) | `index.html`, `register.html`, `forgot-password.html` | All 12 admin/user pages |
| v1.01 | Admin: Dashboard | `admin/dashboard.html` | 11 remaining |
| v1.02 | Admin: Manage Dormitories | `admin/dormitories.html` | 10 remaining |
| v1.03 | Admin: Manage Cottages | `admin/cottages.html` | 9 remaining |
| v1.04 | Admin: Manage Reservations | `admin/reservations.html` | 8 remaining |
| v1.05 | Admin: User Management | `admin/users.html` | 7 remaining |
| v1.06 | Admin: Reports | `admin/reports.html` | 6 remaining |
| v1.07 | Admin: Settings | `admin/settings.html` | 5 remaining (all user pages) |
| v1.08 | User: Dashboard | `user/dashboard.html` | 4 remaining |
| v1.09 | User: View Rooms | `user/rooms.html` | 3 remaining |
| v1.10 | User: New Reservation | `user/reserve.html` | 2 remaining |
| v1.11 | User: My Reservations | `user/my-reservations.html` | 1 remaining |
| v1.12 | User: My Profile (Full System) | `user/profile.html` | none — full system unlocked |

## v2.xx Rollout

A second rollout cycle, starting from a re-gated baseline. `v2.00` unlocks
the same "entry point" pages as the start of the v1.xx cycle plus both
dashboards, and gates every other admin/user page again — the v1.xx history
above stays intact as a permanent record; this is a fresh presentation pass.

| Version | Feature | Pages Unlocked This Version | Pages Still Gated |
|---------|---------|------------------------------|--------------------|
| v2.00 | Login/Register + Admin Dashboard + User Dashboard | `index.html`, `register.html`, `forgot-password.html`, `admin/dashboard.html`, `user/dashboard.html` | `admin/dormitories.html`, `admin/cottages.html`, `admin/reservations.html`, `admin/users.html`, `admin/reports.html`, `admin/settings.html`, `user/rooms.html`, `user/reserve.html`, `user/my-reservations.html`, `user/profile.html` |
| v2.01 | All remaining admin/user pages | `admin/dormitories.html`, `admin/cottages.html`, `admin/reservations.html`, `admin/users.html`, `admin/reports.html`, `admin/settings.html`, `user/rooms.html`, `user/reserve.html`, `user/my-reservations.html`, `user/profile.html` | none — full system unlocked |

## Under Construction Strategy

- `components/under-construction.php` defines `CURRENT_VERSION` and renders a
  full-page styled card (hard-hat icon, version badge, title, description, "Go
  Back" button), then calls `exit` so nothing else on the page runs or renders.
- Every page that isn't part of the current version has
  `<?php require_once '../components/under-construction.php'; ?>` as its very
  first line. Because the gate calls `exit`, the rest of the page's HTML never
  reaches the browser.
- Project pages are plain `.html` files, not `.php`. A project-root `.htaccess`
  (`AllowOverride All` is enabled on the `wdac.local` vhost) tells Apache to run
  `.html` through the PHP handler, so the `<?php ... ?>` gate executes without
  renaming any file or touching any existing link/`href`.
- To unlock a page for its version: delete that one gate line from the page.
  To move a link inside a still-locked page: leave it as-is — clicking it will
  naturally hit that page's own gate.
- Root-level pages (`index.html`, `register.html`, `forgot-password.html`) are
  part of v1.00 and are never gated.

## Git Commands Used Per Version

```bash
# Unlock the page: remove its gate line, bump CURRENT_VERSION in
# components/under-construction.php, then:
git add <unlocked-page.html> components/under-construction.php
git commit -m "feat: implement vX.XX - unlock [Feature Name]"

git tag vX.XX
git push origin main
git push origin vX.XX
```

## How Git Tags Work as Permanent Snapshots

A tag (`git tag vX.XX`) points at the exact commit that represents that
version's state of the repo — even if `main` moves forward afterward, the tag
keeps pointing at that same commit forever (unless explicitly deleted and
recreated). This lets you check out or show any past presented version at any
time with `git checkout vX.XX` or browse it directly on GitHub under
"Releases"/"Tags", regardless of how much further work has landed on `main`.

## GitHub Release Tags

| Version | Tag | Commit Hash |
|---------|-----|--------------|
| v1.00 | `v1.00` | `74728d6b91935f5f8da2154d9c7d18a2bfcbc429` |
| v1.01 | `v1.01` | `a488e879b1919047a525819598e9df675fa13e40` |
| v1.02 | `v1.02` | `bc512b5585e333423c30676d63a1439252effef6` |
| v1.03 | `v1.03` | `7a40f19b2b29a64e8a8d331816b3e1e16c3b774d` |
| v1.04 | `v1.04` | `9c823c760eaf7f87a9810c259b31dd7ac7d1e3d7` |
| v1.05 | `v1.05` | `f713141cb8397450ea5792b2d7ead442cdd04d87` |
| v1.06 | `v1.06` | `43e6ae6a4b3ecd953d4a8c8b98e192c2a3ef86e8` |
| v1.07 | `v1.07` | `cea98304fcc96378b92d6cdcf165dbae24eb3959` |
| v1.08 | `v1.08` | `6a3e73678f3a087c2a3f94202fb4dafa86c049cc` |
| v1.09 | `v1.09` | `912e99ca2c40b022ff6aa166933d091f97efcffb` |
| v1.10 | `v1.10` | `bf350bad57189a748b43f0216756e8800547c2cd` |
| v1.11 | `v1.11` | `a8c79be126b6f61f1ef658e4e962b75448ee32db` |
| v1.12 | `v1.12` | `700230cb5f453ae54a3985e07baf8fabc7e095a7` |
| v2.00 | `v2.00` | `edcc943ac5754f8e775e48ae3cfbe773d28d0275` |

## When a Prof or Client Requests Changes After a Presentation

```bash
# Fix on main first
git checkout main
git add .
git commit -m "feat: update [page] per feedback"
git push origin main

# Delete the old tag and re-create it pointing at the new commit,
# so the version's GitHub release/tag reflects the fix
git tag -d vX.XX
git push origin :refs/tags/vX.XX
git tag vX.XX
git push origin vX.XX
```

Then re-run the hash-collection command below and update the table above.

```bash
git tag | sort | xargs -I{} git log -1 --format="{} %H" {}
```
