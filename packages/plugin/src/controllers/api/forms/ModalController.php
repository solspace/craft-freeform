<?php

namespace Solspace\Freeform\controllers\api\forms;

use craft\helpers\StringHelper;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Transformers\Builder\Form\FormTransformer;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Library\DataObjects\FormModal\CreateFormModal;
use yii\base\Event;

class ModalController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config = [],
        private PropertyProvider $propertyProvider,
        private FormTransformer $formTransformer,
    ) {
        parent::__construct($id, $module, $config);
    }

    protected function get(): array|object
    {
        return $this->propertyProvider->getEditableProperties(CreateFormModal::class);
    }

    protected function post(int|string $id = null): array|object|null
    {
        $data = json_decode($this->request->getRawBody(), false);
        $data->uid = StringHelper::UUID();
        if (!isset($data->type)) {
            $data->type = Regular::class;
        }

        $data->settings = (object) ['general' => (object) []];
        $data->settings->general->name = $data->name;
        $data->settings->general->handle = StringHelper::camelCase($data->name);
        $data->settings->general->formattingTemplate = $data->formattingTemplate;
        $data->settings->general->storeData = $data->storeData;

        $persistData = (object) ['form' => $data];

        $event = new PersistFormEvent($persistData);

        if (empty(trim($data->name))) {
            $event->addErrorsToResponse('form', ['name' => ['Name cannot be empty']]);
        }

        if (empty(trim($data->formattingTemplate))) {
            $event->addErrorsToResponse('form', ['formattingTemplate' => ['You must select a formatting template']]);
        }

        Event::trigger(FormsController::class, FormsController::EVENT_CREATE_FORM, $event);
        Event::trigger(FormsController::class, FormsController::EVENT_UPSERT_FORM, $event);

        $this->response->statusCode = $event->getStatus() ?? 201;
        if ($event->hasErrors()) {
            return $event->getResponseData();
        }

        return $this->formTransformer->transform($event->getForm());
    }
}
