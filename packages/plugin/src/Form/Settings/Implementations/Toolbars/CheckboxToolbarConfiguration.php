<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Toolbars;

use Solspace\Freeform\Attributes\Property\Implementations\Toolbar\ToolbarConfigurationInterface;
use Solspace\Freeform\Attributes\Property\Property;

class CheckboxToolbarConfiguration implements ToolbarConfigurationInterface
{
    public function fetchComponents(?Property $property): array
    {
        return ['bold italic underline strikethrough link | removeformat code'];
    }
}
