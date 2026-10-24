<?php

namespace Solspace\Freeform\Fields\Traits;

use Solspace\Freeform\Attributes\Property\Input;

trait MinLengthTrait
{
    #[Input\Integer(
        unit: 'chars',
        order: 40,
    )]
    protected ?int $minLength = null;

    public function getMinLength(): ?int
    {
        return $this->minLength;
    }
}
