<?php
declare(strict_types=1);

function map_student(array $u): array {
    return [
        'id' => (int)$u['id'],
        'studentNo' => $u['student_no'],
        'firstName' => $u['first_name'],
        'lastName' => $u['last_name'],
        'email' => $u['email'],
        'course' => $u['course'],
        'yearLevel' => $u['year_level'],
        'semester' => $u['semester'],
        'nationality' => $u['nationality'],
        'address' => $u['address'],
        'birthday' => $u['birthday'],
        'phone' => $u['phone'],
        'profilePic' => $u['profile_pic_path'] ?: '',
        'status' => $u['status'],
        'dateRegistered' => substr($u['date_registered'], 0, 10),
    ];
}
