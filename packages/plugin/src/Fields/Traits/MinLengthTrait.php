<?php

namespace Solspace\Freeform\Fields\Traits;

use Solspace\Freeform\Attributes\Property\Input;

trait MinLengthTrait
{
    #[Input\Integer(
        instructions: 'The minimum number of characters allowed in the field.',
        order: 40,
    )]
    protected ?int $minLength = null;

    public function getMinLength(): ?int
    {
        return $this->minLength;
    }
}
