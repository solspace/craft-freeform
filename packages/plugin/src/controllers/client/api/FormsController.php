<?php

namespace Solspace\Freeform\controllers\client\api;

use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use yii\web\NotFoundHttpException;

class FormsController extends BaseApiController
{
    public const EVENT_UPSERT_FORM = 'upsert-form';
    public const EVENT_CREATE_FORM = 'create-form';
    public const EVENT_UPDATE_FORM = 'update-form';

    protected function get(): array
    {
        return $this->getFormsService()->getResolvedForms();
    }

    protected function getOne($id): array|object|null
    {
        $forms = $this->getFormsService()->getResolvedForms(['id' => $id]);
        $form = reset($forms);

        if (!$form) {
            throw new NotFoundHttpException("Form with ID {$id} not found");
        }

        return $form;
    }

    protected function post(int|string $id = null): array|object
    {
        $data = json_decode($this->request->getRawBody(), false);

        $event = new PersistFormEvent($data);
        $this->trigger(self::EVENT_UPSERT_FORM, $event);
        $this->trigger(self::EVENT_UPDATE_FORM, $event);

        $this->response->statusCode = $event->getStatus() ?? 201;

        return $event->getResponseData();
    }

    protected function put(int|string $id = null): array|object
    {
        $data = json_decode($this->request->getRawBody(), false);

        $event = new PersistFormEvent($data, $id);
        $this->trigger(self::EVENT_UPSERT_FORM, $event);
        $this->trigger(self::EVENT_CREATE_FORM, $event);

        $this->response->statusCode = $event->getStatus() ?? 204;

        return $event->getResponseData();
    }
}
