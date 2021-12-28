<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Events\Forms\Types\RegisterFormTypeEvent;
use Solspace\Freeform\Form\Types\Regular;

class FormTypesService extends BaseService
{
    const EVENT_REGISTER_FORM_TYPES = 'register-form-types';

    public function getTypes(): array
    {
        $event = new RegisterFormTypeEvent();
        $event->addType(Regular::class);

        $this->trigger(self::EVENT_REGISTER_FORM_TYPES, $event);

        return $event->getTypes();
    }
}
