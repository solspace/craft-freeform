<?php

namespace Solspace\Freeform\Bundles\Fields\Types;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExtraFieldInterface;
use yii\base\Event;

class RegisterFieldTypesEvent extends Event
{
    private array $types = [];

    public function getTypes(): array
    {
        return $this->types;
    }

    public function addType(string ...$classes): self
    {
        $isPro = Freeform::getInstance()->isPro();
        foreach ($classes as $class) {
            $reflection = new \ReflectionClass($class);

            if ($reflection->implementsInterface(ExtraFieldInterface::class) && !$isPro) {
                continue;
            }

            if (
                $reflection->implementsInterface(FieldInterface::class)
                && !\in_array($class, $this->types, true)
            ) {
                $this->types[] = $class;
            }
        }

        return $this;
    }
}
