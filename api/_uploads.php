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

/**
 * Handle up to 5 gallery image uploads.
 * Supports:
 * - Individual slot inputs: image_0 (or image), image_1, image_2, image_3, image_4
 * - Multiple file input: images[]
 * - Merges with existing images so unreplaced slots are preserved on update.
 */
function handle_gallery_uploads(string $subdir, array $existingImages = []): array {
    $images = array_values(array_filter($existingImages));
    while (count($images) < 5) {
        $images[] = '';
    }
    $images = array_slice($images, 0, 5);

    // Individual slot uploads
    for ($i = 0; $i < 5; $i++) {
        $key = ($i === 0 && isset($_FILES['image']) && !isset($_FILES['image_0'])) ? 'image' : "image_$i";
        if (isset($_FILES[$key]) && is_array($_FILES[$key]) && ($_FILES[$key]['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
            $saved = save_uploaded_image($_FILES[$key], $subdir);
            if ($saved) {
                $images[$i] = $saved;
            }
        }
    }

    // Multiple file array upload
    if (isset($_FILES['images']) && is_array($_FILES['images']['name'])) {
        $count = count($_FILES['images']['name']);
        for ($i = 0; $i < $count && $i < 5; $i++) {
            if (($_FILES['images']['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
                $fileItem = [
                    'name' => $_FILES['images']['name'][$i],
                    'type' => $_FILES['images']['type'][$i],
                    'tmp_name' => $_FILES['images']['tmp_name'][$i],
                    'error' => $_FILES['images']['error'][$i],
                    'size' => $_FILES['images']['size'][$i],
                ];
                $saved = save_uploaded_image($fileItem, $subdir);
                if ($saved) {
                    $images[$i] = $saved;
                }
            }
        }
    }

    $cleaned = array_values(array_filter($images, fn($v) => !empty($v)));
    return $cleaned;
}
