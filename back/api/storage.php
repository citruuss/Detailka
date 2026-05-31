<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['users'])) {
    $_SESSION['users'] = [
        [
            'id' => 1,
            'name' => 'Администратор',
            'email' => 'admin@detailka.ru',
            'password' => password_hash('1234', PASSWORD_DEFAULT),
            'age' => 30,
            'role' => 'admin'
        ],
        [
            'id' => 3,
            'name' => 'Anna',
            'email' => 'Anna@a.ru',
            'password' => password_hash('1234', PASSWORD_DEFAULT),
            'age' => 20,
            'role' => 'user'
        ],
        [
            'id' => 4,
            'name' => 'Поставьте 5 пожалуйста!',
            'email' => 'IloveKSP@hochu5.ru',
            'password' => password_hash('1234', PASSWORD_DEFAULT),
            'age' => 5,
            'role' => 'user'
        ]
    ];
}

function getUsersRaw() {
    return $_SESSION['users'];
}

function saveUsers($users) {
    $_SESSION['users'] = $users;
}

function getUsersPublic() {
    $users = $_SESSION['users'];

    foreach ($users as &$user) {
        unset($user['password']);
    }

    return $users;
}

function getUserById($id) {
    foreach ($_SESSION['users'] as $user) {
        if ($user['id'] == $id) {
            unset($user['password']);
            return $user;
        }
    }

    return null;
}

function getUserByEmail($email) {
    foreach ($_SESSION['users'] as $user) {
        if ($user['email'] === $email) {
            return $user;
        }
    }

    return null;
}