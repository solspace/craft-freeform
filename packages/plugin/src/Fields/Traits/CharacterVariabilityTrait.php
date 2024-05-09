<?php

namespace Solspace\Freeform\Fields\Traits;

use Solspace\Freeform\Attributes\Property\Input;

trait CharacterVariabilityTrait
{
    #[Input\Boolean(
        instructions: 'The field should contain at least one number, one lowercase letter, one uppercase letter, and one special character.',
        order: 60,
    )]
    protected bool $useCharacterVariability = false;

    public function isUseCharacterVariability(): bool
    {
        return $this->useCharacterVariability;
    }
}
