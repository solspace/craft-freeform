<?php

namespace Solspace\Freeform\Twig\Extensions;

use Solspace\Freeform\Variables\FreeformVariable;
use Twig\Extension\AbstractExtension;
use Twig\Extension\GlobalsInterface;

class FreeformGlobalsExtension extends AbstractExtension implements GlobalsInterface
{
    public function getGlobals(): array
    {
        return [
            'freeform' => new FreeformVariable(),
        ];
    }
}
