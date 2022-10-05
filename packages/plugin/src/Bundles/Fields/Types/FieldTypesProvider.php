<?php

namespace Solspace\Freeform\Bundles\Fields\Types;

use Solspace\Freeform\Library\DataObjects\FieldType;
use yii\base\Event;

class FieldTypesProvider
{
    public const EVENT_REGISTER_FIELD_TYPES = 'register-field-types';

    /** @var FieldType[] */
    private ?array $registeredFieldTypes = null;

    public function getTypes(): array
    {
        if (null === $this->registeredFieldTypes) {
            $event = new RegisterFieldTypesEvent();
            Event::trigger(self::class, self::EVENT_REGISTER_FIELD_TYPES, $event);

            $this->registeredFieldTypes = array_filter(
                array_map(
                    fn ($class) => new FieldType($class),
                    $event->getTypes()
                )
            );
        }

        return $this->registeredFieldTypes;
    }

    public function getTypeShorthands(): array
    {
        return array_map(
            fn (FieldType $type) => $type->getTypeShorthand(),
            $this->getTypes()
        );
    }
}
