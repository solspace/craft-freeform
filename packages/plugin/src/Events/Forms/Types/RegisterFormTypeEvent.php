<?php

namespace Solspace\Freeform\Events\Forms\Types;

use Solspace\Freeform\Library\Exceptions\FormExceptions\InvalidFormTypeException;
use Solspace\Freeform\Library\FormTypes\FormTypeInterface;
use yii\base\Event;

class RegisterFormTypeEvent extends Event
{
    private $types;

    /**
     * @param class-string<FormTypeInterface> $className
     *
     * @throws \ReflectionException
     */
    public function addType(string $className)
    {
        $reflection = new \ReflectionClass($className);
        if (!$reflection->implementsInterface(FormTypeInterface::class)) {
            throw new InvalidFormTypeException('Supplied Form type does not implement the FormTypeInterface');
        }

        $this->types[$className] = [
            'class' => $className,
            'name' => $className::getTypeName(),
            'properties' => $className::getPropertyManifest(),
        ];
    }

    /**
     * @return class-string<FormTypeInterface>[]
     */
    public function getTypes(): array
    {
        return array_values($this->types);
    }
}
