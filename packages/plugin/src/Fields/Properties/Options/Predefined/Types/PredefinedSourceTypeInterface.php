<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types;

use Solspace\Freeform\Fields\Properties\Options\OptionTypeProviderInterface;

interface PredefinedSourceTypeInterface extends OptionTypeProviderInterface
{
    public const DISPLAY_ABBREVIATED = 'abbreviated';
    public const DISPLAY_FULL = 'full';
    public const DISPLAY_FULL_TRANSLATED = 'full-translated';
}
