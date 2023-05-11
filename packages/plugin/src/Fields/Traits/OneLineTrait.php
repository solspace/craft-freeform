<?php

namespace Solspace\Freeform\Fields\Traits;

use Solspace\Freeform\Attributes\Property\Input;

trait OneLineTrait
{
    #[Input\Boolean('Show all options in a single line?')]
    protected bool $oneLine = false;

    public function isOneLine(): bool
    {
        return $this->oneLine;
    }
}
