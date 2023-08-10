<?php

namespace Solspace\Freeform\controllers;

use Solspace\Freeform\Library\Exceptions\Api\ApiException;
use Symfony\Component\Serializer\Serializer;
use yii\web\NotFoundHttpException;
use yii\web\Response;

abstract class BaseApiController extends BaseController
{
    public function actionIndex($id = null): Response
    {
        $request = $this->request;

        try {
            $content = match ($request->method) {
                'GET' => null !== $id ? $this->getOne($id) : $this->get(),
                'POST' => $this->post($id),
                'PUT' => $this->put($id),
                'DELETE' => $this->delete($id),
                default => throw new NotFoundHttpException('Method not supported'),
            };
        } catch (ApiException $exception) {
            $this->response->statusCode = $exception->getCode();

            return $this->asJson(['errors' => $exception->getErrors()->asArray()]);
        }

        if (null === $content) {
            return $this->asEmptyResponse();
        }

        return $this->asSerializedJson($content);
    }

    protected function get(): array|object
    {
        throw new NotFoundHttpException('GET request not supported');
    }

    protected function getOne(int|string $id): array|object|null
    {
        throw new NotFoundHttpException('GET request not supported');
    }

    protected function post(int|string $id = null): array|object|null
    {
        throw new NotFoundHttpException('POST request not supported');
    }

    protected function put(int|string $id = null): array|object|null
    {
        throw new NotFoundHttpException('PUT request not supported');
    }

    protected function delete(int $id): bool|null
    {
        throw new NotFoundHttpException('DELETE request not supported');
    }

    protected function getSerializer(): Serializer
    {
        return \Craft::$container->get(Serializer::class);
    }

    protected function asEmptyResponse(): Response
    {
        $this->response->format = Response::FORMAT_RAW;
        $this->response->content = '';

        return $this->response;
    }

    protected function asSerializedJson(mixed $content, int $statusCode = 200): Response
    {
        $serialized = $this->getSerializer()->serialize($content, 'json', ['preserve_empty_objects' => true]);

        $this->response->format = Response::FORMAT_JSON;
        $this->response->content = $serialized;
        if ($statusCode) {
            $this->response->statusCode = $statusCode;
        }

        return $this->response;
    }
}
