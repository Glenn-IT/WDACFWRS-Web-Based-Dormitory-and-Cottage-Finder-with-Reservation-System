<?php
declare(strict_types=1);

define('CURRENT_VERSION', 'v2.00');
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Under Construction | CSU-Piat Dormitory &amp; Cottage Finder</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet">
  <style>
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fdf6f0;
      margin: 0;
    }
    .uc-card {
      max-width: 480px;
      width: 100%;
      background: #fff;
      border-radius: 1rem;
      padding: 3rem 2.5rem;
      text-align: center;
      box-shadow: 0 1rem 3rem rgba(0, 0, 0, .1);
      margin: 1rem;
    }
    .uc-icon {
      font-size: 3rem;
      color: #FF8B5A;
      margin-bottom: 1rem;
    }
    .uc-badge {
      display: inline-block;
      background: #FF5A5A;
      color: #fff;
      font-weight: 600;
      padding: .35rem .9rem;
      border-radius: 2rem;
      font-size: .85rem;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <div class="uc-card">
    <div class="uc-icon"><i class="fa-solid fa-hard-hat"></i></div>
    <div><span class="uc-badge"><?= htmlspecialchars(CURRENT_VERSION) ?></span></div>
    <h4 class="fw-bold mb-2">Page Under Construction</h4>
    <p class="text-muted mb-4">This feature hasn't been unlocked yet in the current presentation version. Please check back in a later release.</p>
    <button type="button" class="btn btn-danger px-4" id="uc-logout-btn">
      <i class="fa-solid fa-right-from-bracket me-1"></i> Logout
    </button>
  </div>
  <script>
    document.getElementById('uc-logout-btn').addEventListener('click', async function () {
      var base = window.location.pathname.includes('/user/') || window.location.pathname.includes('/admin/') ? '../' : '';
      try { await fetch(base + 'api/auth/logout.php', { method: 'POST' }); } catch (e) {}
      window.location.href = base + 'index.html';
    });
  </script>
</body>
</html>
<?php
exit;
