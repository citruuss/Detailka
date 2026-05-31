<?php

require_once __DIR__ . '/storage.php';

class UserService
{
    public function getAll(): array
    {
        return getUsersPublic();
    }

    public function getById(int $id): ?array
    {
        return getUserById($id);
    }

    public function create(array $data): array
    {
        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');
        $age = $data['age'] ?? null;

        if ($name === '') {
            return ['error' => 'Имя обязательно для заполнения'];
        }

        if ($email === '') {
            return ['error' => 'Email обязателен для заполнения'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['error' => 'Неверный формат email'];
        }

        if ($password === '') {
            return ['error' => 'Пароль обязателен для заполнения'];
        }

        if (strlen($password) < 4) {
            return ['error' => 'Пароль должен содержать минимум 4 символа'];
        }

        if (getUserByEmail($email)) {
            return ['error' => 'Пользователь с таким email уже существует'];
        }

        $users = getUsersRaw();

        $maxId = 0;

        foreach ($users as $user) {
            if ($user['id'] > $maxId) {
                $maxId = $user['id'];
            }
        }

        $newUser = [
            'id' => $maxId + 1,
            'name' => $name,
            'email' => $email,
            'password' => password_hash($password, PASSWORD_DEFAULT),
            'age' => $age ? (int)$age : null,
            'role' => 'user'
        ];

        $users[] = $newUser;

        saveUsers($users);

        unset($newUser['password']);

        return $newUser;
    }

    public function update(int $id, array $data): array
    {
        $users = getUsersRaw();
        $found = false;

        foreach ($users as &$user) {
            if ($user['id'] == $id) {
                if (isset($data['name'])) {
                    $user['name'] = trim($data['name']);
                }

                if (isset($data['age'])) {
                    $user['age'] = (int)$data['age'];
                }

                if (isset($data['password'])) {
                    $user['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
                }

                $found = true;
                break;
            }
        }

        if (!$found) {
            return ['error' => 'Пользователь не найден'];
        }

        saveUsers($users);

        return getUserById($id);
    }

    public function delete(int $id): array
    {
        $users = getUsersRaw();
        $newUsers = [];
        $found = false;

        foreach ($users as $user) {
            if ($user['id'] == $id) {
                $found = true;
                continue;
            }

            $newUsers[] = $user;
        }

        if (!$found) {
            return ['error' => 'Пользователь не найден'];
        }

        saveUsers($newUsers);

        return [
            'success' => true,
            'message' => 'Пользователь удалён'
        ];
    }
}