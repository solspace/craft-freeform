<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<string>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class TextArea extends Property
{
    public ?string $type = 'textarea';
}
