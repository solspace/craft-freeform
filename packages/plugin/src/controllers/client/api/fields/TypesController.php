<?php

namespace Solspace\Freeform\controllers\client\api\fields;

use Solspace\Freeform\controllers\BaseApiController;

class TypesController extends BaseApiController
{
    protected function get(): array
    {
        return $this->getFieldsService()->getFieldTypesInfo();
    }
}
