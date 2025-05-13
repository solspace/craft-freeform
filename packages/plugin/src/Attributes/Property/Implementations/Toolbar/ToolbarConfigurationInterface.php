<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Toolbar;

use Solspace\Freeform\Attributes\Property\Property;

interface ToolbarConfigurationInterface
{
    public function fetchToolbar(?Property $property): array;
}
