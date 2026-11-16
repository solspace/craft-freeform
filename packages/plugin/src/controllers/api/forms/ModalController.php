<?php

namespace Solspace\Freeform\controllers\api\forms;

use craft\helpers\StringHelper;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Settings\DefaultsProvider;
use Solspace\Freeform\Bundles\Transformers\Builder\Form\FormTransformer;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\FormModal\CreateFormModal;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use yii\base\Event;

class ModalController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private PropertyProvider $propertyProvider,
        private FormTransformer $formTransformer,
        private LimitedUserChecker $checker,
        private DefaultsProvider $defaults,
    ) {
        parent::__construct($id, $module, $config);
    }

    protected function get(): array|object
    {
        $properties = $this->propertyProvider->getEditableProperties(CreateFormModal::class);
        $type = $properties->get('type');
        $type->value = $type->value ?: Regular::class;

        return array_values(array_filter(
            $properties->getProperties(),
            static fn (Property $property) => $property->visible,
        ));
    }

    protected function post(int|string|null $id = null): array|object|null
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_CREATE);

        $data = json_decode($this->request->getRawBody(), false);
        $data->uid = StringHelper::UUID();
        $defaultType = $this->defaults->getValue('settings.general.formType') ?: Regular::class;
        if (!isset($data->type)) {
            $data->type = $defaultType;
        }
        if (!\is_string($data->type) || !\in_array($data->type, array_column(Freeform::getInstance()->formTypes->getTypes(), 'class'), true)
            || ($defaultType !== $data->type && ($this->defaults->isLocked('settings.general.formType') || !$this->checker->can('settings.tab.general.type')))) {
            $this->response->statusCode = 400;

            return ['message' => Freeform::t('Choose an available form type.')];
        }

        if (!isset($data->formattingTemplate)) {
            $data->formattingTemplate = '';
        }

        $data->settings = (object) ['general' => (object) []];
        $data->settings->general->name = $data->name;
        $data->settings->general->type = $data->type;
        $data->settings->general->handle = $data->handle;
        $data->settings->general->formattingTemplate = $data->formattingTemplate;
        $data->settings->general->storeData = $data->storeData;

        if (!empty($data->sites)) {
            $data->settings->general->sites = $data->sites;
        } else {
            $data->settings->general->sites = SitesHelper::getEditableSiteIds();
        }

        $persistData = (object) ['form' => $data];

        $event = new PersistFormEvent($persistData);

        if (empty(trim($data->name))) {
            $event->addErrorsToResponse('form', ['name' => ['Name cannot be empty']]);
        }

        Event::trigger(FormsController::class, FormsController::EVENT_CREATE_FORM, $event);
        Event::trigger(FormsController::class, FormsController::EVENT_UPSERT_FORM, $event);

        $this->response->statusCode = $event->getStatus() ?? 201;
        if ($event->hasErrors()) {
            return $event->getResponseData();
        }

        Event::trigger(FormsController::class, FormsController::EVENT_AFTER_SAVE_FORM, $event);

        return $this->formTransformer->transform($event->getForm());
    }
}
