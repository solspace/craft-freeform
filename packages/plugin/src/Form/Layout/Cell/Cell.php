<?php

namespace Solspace\Freeform\Form\Layout\Cell;

abstract class Cell implements CellInterface
{
    public static function create(array $config): CellInterface
    {
        $type = $config['type'] ?? self::TYPE_FIELD;

        /** @var CellInterface $class */
        $class = match ($type) {
            self::TYPE_FIELD => FieldCell::class,
            self::TYPE_LAYOUT => LayoutCell::class,
        };

        return new $class($config);
    }
}
