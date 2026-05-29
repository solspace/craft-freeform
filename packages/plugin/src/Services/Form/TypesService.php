<?php

namespace Solspace\Freeform\Services\Form;

use Solspace\Freeform\Attributes\Form\Type;
use Solspace\Freeform\Events\Forms\Types\RegisterFormTypeEvent;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Services\BaseService;

class TypesService extends BaseService
{
    public const EVENT_REGISTER_FORM_TYPES = 'register-form-types';

    private array $typeCache = [];

    /**
     * @return Type[]
     */
    public function getTypes(bool $includeDefault = true): array
    {
        $key = $includeDefault ? 'default' : 'no-default';

        $isCached = isset($this->typeCache[$key]);
        if ($isCached === false) {
            $event = new RegisterFormTypeEvent();
            if ($includeDefault) {
                $event->addType(Regular::class);
            }

            $this->trigger(self::EVENT_REGISTER_FORM_TYPES, $event);

            $this->typeCache[$key] = $event->getTypes();
        }

        return $this->typeCache[$key];
    }
}
