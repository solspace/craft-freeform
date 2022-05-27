<?php

namespace Solspace\Freeform\controllers\client\api;

use Solspace\Freeform\controllers\BaseApiController;

class FieldTypesController extends BaseApiController
{
    protected function get(): array
    {
        return $this->getFieldsService()->getFieldTypesInfo();
    }
}
