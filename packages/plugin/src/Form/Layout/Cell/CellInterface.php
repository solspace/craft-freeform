<?php

namespace Solspace\Freeform\Form\Layout\Cell;

interface CellInterface
{
    public const TYPE_FIELD = 'field';
    public const TYPE_LAYOUT = 'layout';

    public function __construct(array $config);
}
