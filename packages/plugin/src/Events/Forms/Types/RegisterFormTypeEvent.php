<?php

namespace Solspace\Freeform\Events\Forms\Types;

use Solspace\Freeform\Attributes\Form\Type;
use Solspace\Freeform\Library\Exceptions\FormExceptions\InvalidFormTypeException;
use Solspace\Freeform\Library\FormTypes\FormTypeInterface;
use Solspace\Freeform\Library\Helpers\AttributeHelper;
use yii\base\Event;

class RegisterFormTypeEvent extends Event
{
    private array $types = [];

    /**
     * @param class-string<FormTypeInterface> $className
     *
     * @throws \ReflectionException
     */
    public function addType(string $className): self
    {
        $reflection = new \ReflectionClass($className);
        if (!$reflection->implementsInterface(FormTypeInterface::class)) {
            throw new InvalidFormTypeException('Supplied Form type does not implement the FormTypeInterface');
        }

        $type = AttributeHelper::findAttribute($reflection, Type::class);
        if (!$type) {
            return $this;
        }

        $type->class = $className;
        if (!$type->name) {
            $type->name = $reflection->getShortName();
        }

        $this->types[] = $type;

        return $this;
    }

    /**
     * @return class-string<FormTypeInterface>[]
     */
    public function getTypes(): array
    {
        return $this->types;
    }
}
