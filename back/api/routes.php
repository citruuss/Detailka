<?php

require_once __DIR__ . '/UserController.php';

$controller = new UserController();

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '';

$userId = null;

if (preg_match('/^\/users\/(\d+)$/', $path, $matches)) {
    $userId = (int)$matches[1];
    $path = '/users';
}

$logEntry = date('Y-m-d H:i:s') . " - " . $method . " " . $path . " ID:" . ($userId ?? 'null') . PHP_EOL;
file_put_contents(__DIR__ . '/api.log', $logEntry, FILE_APPEND);

if ($path === '/users' && $method === 'GET' && !$userId) {
    $controller->getAllUsers();
    exit();
}

if ($path === '/users' && $method === 'GET' && $userId) {
    $controller->getUser($userId);
    exit();
}

if ($path === '/users' && $method === 'POST') {
    $controller->createUser();
    exit();
}

if ($path === '/users' && $method === 'PUT' && $userId) {
    $controller->updateUser($userId);
    exit();
}

if ($path === '/users' && $method === 'DELETE' && $userId) {
    $controller->deleteUser($userId);
    exit();
}

http_response_code(404);

echo json_encode([
    'error' => 'Маршрут не найден',
    'method' => $method,
    'path' => $path
], JSON_UNESCAPED_UNICODE);