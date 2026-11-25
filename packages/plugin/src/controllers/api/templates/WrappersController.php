<?php

namespace Solspace\Freeform\controllers\api\templates;

use Solspace\Freeform\controllers\BaseCpApiController;
use Solspace\Freeform\Freeform;

class WrappersController extends BaseCpApiController
{
    protected function get(): array
    {
        return Freeform::getInstance()->notificationWrappers->getAll();
    }
}
