<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . '/storage.php';

unset($_SESSION['user_id']);
unset($_SESSION['user_name']);
unset($_SESSION['user_email']);
unset($_SESSION['user_role']);

echo json_encode([
    'success' => true,
    'message' => 'Вы вышли из системы'
], JSON_UNESCAPED_UNICODE);