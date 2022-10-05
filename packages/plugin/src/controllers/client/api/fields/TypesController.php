<?php

namespace Solspace\Freeform\controllers\client\api\fields;

use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\controllers\BaseApiController;

class TypesController extends BaseApiController
{
    public function __construct($id, $module, $config = [], private FieldTypesProvider $fieldTypesProvider)
    {
        parent::__construct($id, $module, $config);
    }

    protected function get(): array
    {
        return $this->fieldTypesProvider->getTypes();
    }
}
