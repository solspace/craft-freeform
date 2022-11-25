<?php

namespace Solspace\Freeform\Form\Layout\Cell;

abstract class Cell implements CellInterface
{
    public const TYPE_FIELD = 'field';
    public const TYPE_LAYOUT = 'layout';

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
