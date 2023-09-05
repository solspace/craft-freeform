<?php

namespace Solspace\Freeform\Fields\Traits;

use Solspace\Freeform\Attributes\Property\Input\Text;

trait DefaultArrayValueTrait
{
    #[Text(
        instructions: 'Enter a default value for this field',
    )]
    protected array $defaultValue = [];

    public function getDefaultValue(): array
    {
        return $this->defaultValue;
    }
}
