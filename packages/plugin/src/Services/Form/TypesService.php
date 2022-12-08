<?php

namespace Solspace\Freeform\Services\Form;

use Solspace\Freeform\Events\Forms\Types\RegisterFormTypeEvent;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Services\BaseService;

class TypesService extends BaseService
{
    public const EVENT_REGISTER_FORM_TYPES = 'register-form-types';

    public function getTypes(bool $includeDefault = true): array
    {
        $event = new RegisterFormTypeEvent();
        if ($includeDefault) {
            $event->addType(Regular::class);
        }

        $this->trigger(self::EVENT_REGISTER_FORM_TYPES, $event);

        return $event->getTypes();
    }
}
