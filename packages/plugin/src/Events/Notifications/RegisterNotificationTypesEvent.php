<?php

namespace Solspace\Freeform\Events\Notifications;

use Solspace\Freeform\Attributes\Notification\Type;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Notifications\NotificationInterface;

class RegisterNotificationTypesEvent extends ArrayableEvent
{
    /** @var Type[] */
    private array $types = [];

    public function __construct(private PropertyProvider $propertyProvider)
    {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['types'];
    }

    public function getTypes(): array
    {
        return $this->types;
    }

    public function addType(string $class): void
    {
        $reflection = new \ReflectionClass($class);
        if (!$reflection->implementsInterface(NotificationInterface::class)) {
            return;
        }

        $typeAttributes = $reflection->getAttributes(Type::class);
        $type = reset($typeAttributes);

        $type = $type ? $type->newInstance() : null;
        if (!$type) {
            return;
        }

        $type->class = $class;
        $type->icon = $type->icon ? file_get_contents($type->icon) : null;
        $type->setProperties($this->propertyProvider->getEditableProperties($class));

        $this->types[] = $type;
    }
}
