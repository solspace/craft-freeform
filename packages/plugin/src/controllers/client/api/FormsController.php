<?php

namespace Solspace\Freeform\controllers\client\api;

use Solspace\Freeform\Bundles\Fields\AttributeProvider;
use Solspace\Freeform\Bundles\Transformers\Builder\Form\FormTransformer;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Form\Types\Regular;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class FormsController extends BaseApiController
{
    public const EVENT_UPSERT_FORM = 'upsert-form';
    public const EVENT_CREATE_FORM = 'create-form';
    public const EVENT_UPDATE_FORM = 'update-form';

    public function __construct(
        $id,
        $module,
        $config = [],
        private FormTransformer $formTransformer,
        private AttributeProvider $attributeProvider,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionEditableProperties(): Response
    {
        // TODO: Support for Form Types
        return $this->asJson($this->attributeProvider->getEditableProperties(Regular::class));
    }

    protected function get(): array
    {
        return $this->formTransformer->transformList(
            array_values(
                $this->getFormsService()->getAllForms()
            )
        );
    }

    protected function getOne($id): array|object|null
    {
        $form = $this->getFormsService()->getFormById($id);
        if (!$form) {
            throw new NotFoundHttpException("Form with ID {$id} not found");
        }

        return $this->formTransformer->transform($form);
    }

    protected function post(int|string $id = null): array|object
    {
        $data = json_decode($this->request->getRawBody(), false);

        $event = new PersistFormEvent($data);
        $this->trigger(self::EVENT_CREATE_FORM, $event);
        $this->trigger(self::EVENT_UPSERT_FORM, $event);

        $this->response->statusCode = $event->getStatus() ?? 201;

        return $event->getResponseData();
    }

    protected function put(int|string $id = null): array|object
    {
        $data = json_decode($this->request->getRawBody(), false);

        $event = new PersistFormEvent($data, $id);
        $this->trigger(self::EVENT_UPDATE_FORM, $event);
        $this->trigger(self::EVENT_UPSERT_FORM, $event);

        $this->response->statusCode = $event->getStatus() ?? 204;

        return $event->getResponseData();
    }
}
