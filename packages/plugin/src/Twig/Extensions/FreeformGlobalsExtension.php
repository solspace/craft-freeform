<?php

namespace Solspace\Freeform\Twig\Extensions;

use Solspace\Freeform\Library\Resources\Craft6BooleanMenu;
use Solspace\Freeform\Variables\FreeformVariable;
use Twig\Extension\AbstractExtension;
use Twig\Extension\GlobalsInterface;
use Twig\TwigFunction;

class FreeformGlobalsExtension extends AbstractExtension implements GlobalsInterface
{
    public function getFunctions(): array
    {
        return [new TwigFunction('freeformBooleanMenu', Craft6BooleanMenu::render(...), ['is_safe' => ['html']])];
    }

    public function getGlobals(): array
    {
        return [
            'freeform' => new FreeformVariable(),
        ];
    }
}
