<?php
// back/api/logs.php
// Получение логов авторизации

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: text/plain; charset=utf-8");

$logFile = __DIR__ . '/../logs/auth.log';

if (file_exists($logFile)) {
    $content = file_get_contents($logFile);
    echo $content ?: "Логи отсутствуют";
} else {
    echo "Файл логов не найден. Записи появятся после попыток входа.";
}
?>