<?php

namespace Solspace\Freeform\controllers;

use yii\web\NotFoundHttpException;
use yii\web\Response;

abstract class BaseApiController extends BaseController
{
    public function actionIndex($id = null): Response
    {
        $request = $this->request;
        $response = match ($request->method) {
            'GET' => null !== $id ? $this->getOne($id) : $this->get(),
            'POST' => $this->post($id),
            'DELETE' => $this->delete($id),
            default => throw new NotFoundHttpException('Method not supported'),
        };

        return $this->asJson($response);
    }

    protected function get(): array
    {
        throw new NotFoundHttpException('GET request not supported');
    }

    protected function getOne(int|string $id): array|object|null
    {
        throw new NotFoundHttpException('GET request not supported');
    }

    protected function post(int|string $id = null): array|object
    {
        throw new NotFoundHttpException('POST request not supported');
    }

    protected function delete(int $id): bool
    {
        throw new NotFoundHttpException('DELETE request not supported');
    }
}
