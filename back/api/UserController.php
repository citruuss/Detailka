<?php

require_once __DIR__ . '/UserService.php';

class UserController
{
    private UserService $service;

    public function __construct()
    {
        $this->service = new UserService();
    }

    private function getInput(): array
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            return [];
        }

        return $input;
    }

    private function response($data, int $statusCode = 200): void
    {
        http_response_code($statusCode);

        echo json_encode(
            $data,
            JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
        );
    }

    public function getAllUsers(): void
    {
        $users = $this->service->getAll();

        $this->response($users);
    }

    public function getUser(int $id): void
    {
        $user = $this->service->getById($id);

        if (!$user) {
            $this->response(
                ['error' => 'Пользователь не найден'],
                404
            );
            return;
        }

        $this->response($user);
    }

    public function createUser(): void
    {
        $data = $this->getInput();

        $result = $this->service->create($data);

        if (isset($result['error'])) {
            $this->response($result, 400);
            return;
        }

        $this->response($result, 201);
    }

    public function updateUser(int $id): void
    {
        $data = $this->getInput();

        $result = $this->service->update($id, $data);

        if (isset($result['error'])) {
            $this->response($result, 404);
            return;
        }

        $this->response($result);
    }

    public function deleteUser(int $id): void
    {
        $result = $this->service->delete($id);

        if (isset($result['error'])) {
            $this->response($result, 404);
            return;
        }

        $this->response($result);
    }
}