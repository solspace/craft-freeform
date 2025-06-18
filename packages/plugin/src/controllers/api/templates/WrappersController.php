<?php

namespace Solspace\Freeform\controllers\api\templates;

use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;

class WrappersController extends BaseApiController
{
    protected function get(): array
    {
        return Freeform::getInstance()->notificationWrappers->getAll();
    }
}
