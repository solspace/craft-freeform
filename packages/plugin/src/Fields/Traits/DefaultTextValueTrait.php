<?php

namespace Solspace\Freeform\Fields\Traits;

use Solspace\Freeform\Attributes\Property\Input\Text;

trait DefaultTextValueTrait
{
    #[Text(
        instructions: 'Enter a default value for this field',
    )]
    protected string $defaultValue = '';

    public function getDefaultValue(): string
    {
        return $this->defaultValue;
    }
}
