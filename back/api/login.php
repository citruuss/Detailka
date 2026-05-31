<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/storage.php';

function logAuth($email, $success, $message = '') {
    $logFile = __DIR__ . '/../logs/auth.log';
    $dir = dirname($logFile);

    if (!file_exists($dir)) {
        mkdir($dir, 0777, true);
    }

    $status = $success ? 'УСПЕХ' : 'НЕУДАЧА';

    $line = date('Y-m-d H:i:s')
        . " | status=" . $status
        . " | email=" . $email
        . " | message=" . $message
        . PHP_EOL;

    file_put_contents($logFile, $line, FILE_APPEND);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешён'], JSON_UNESCAPED_UNICODE);
    exit();
}

$inputData = json_decode(file_get_contents('php://input'), true);

$email = trim($inputData['email'] ?? '');
$password = trim($inputData['password'] ?? '');

if ($email === '' || $password === '') {
    logAuth($email, false, 'Пустые поля');
    echo json_encode([
        'success' => false,
        'message' => 'Email и пароль обязательны'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

$user = getUserByEmail($email);

if (!$user) {
    logAuth($email, false, 'Пользователь не найден');
    echo json_encode([
        'success' => false,
        'message' => 'Пользователь не найден'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

if (!password_verify($password, $user['password'])) {
    logAuth($email, false, 'Неверный пароль');
    echo json_encode([
        'success' => false,
        'message' => 'Неверный пароль'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

$_SESSION['user_id'] = $user['id'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_email'] = $user['email'];
$_SESSION['user_role'] = $user['role'];

unset($user['password']);

logAuth($email, true, 'Успешный вход');

echo json_encode([
    'success' => true,
    'message' => 'Вход выполнен успешно',
    'user' => $user
], JSON_UNESCAPED_UNICODE);