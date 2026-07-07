<?php
declare(strict_types=1);

/** Validate + move an uploaded image into assets/uploads/<subdir>/, return the relative web path or null if no file given. */
function save_uploaded_image(array $file, string $subdir): ?string {
    if (!isset($file['error']) || $file['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        fail('Image upload failed.');
    }
    if ($file['size'] > 5 * 1024 * 1024) {
        fail('Image must be smaller than 5MB.');
    }
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    $mime = mime_content_type($file['tmp_name']);
    if (!isset($allowed[$mime])) {
        fail('Only JPG, PNG, WEBP, or GIF images are allowed.');
    }
    $ext = $allowed[$mime];
    $filename = bin2hex(random_bytes(16)) . '.' . $ext;
    $dir = __DIR__ . '/../assets/uploads/' . $subdir;
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $dest = $dir . '/' . $filename;
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        fail('Could not save uploaded image.');
    }
    return 'assets/uploads/' . $subdir . '/' . $filename;
}
