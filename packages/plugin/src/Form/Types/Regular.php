<?php

namespace Solspace\Freeform\Form\Types;

use Solspace\Freeform\Form\Form;

class Regular extends Form
{
    public static function getTypeName(): string
    {
        return 'Regular';
    }

    public static function getPropertyManifest(): array
    {
        return [];
    }
}
