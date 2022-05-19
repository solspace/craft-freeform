<?php

namespace Solspace\Freeform\controllers\client\api;

use Solspace\Freeform\controllers\BaseApiController;

class FormsController extends BaseApiController
{
    protected function get(): array
    {
        return $this->getFormsService()->getResolvedForms();
    }
}
