<?php

namespace Solspace\Freeform\controllers\client\api\forms;

use Solspace\Freeform\Bundles\Fields\AttributeProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Form\Types\Regular;

class EditablePropertiesController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private AttributeProvider $attributeProvider
    ) {
        parent::__construct($id, $module, $config ?? []);
    }

    public function actionGet(): array
    {
        return $this->asJson($this->attributeProvider->getEditableProperties(Regular::class));
    }
}
