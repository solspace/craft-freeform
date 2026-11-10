<?php

namespace Solspace\Freeform\Fields\Traits;

use Solspace\Freeform\Attributes\Property\Input;

trait MaxLengthTrait
{
    #[Input\Integer(
        unit: 'chars',
        order: 50,
    )]
    protected ?int $maxLength = null;

    public function getMaxLength(): ?int
    {
        return $this->maxLength;
    }
}
