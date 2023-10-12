<?php

namespace Solspace\Freeform\Fields\Traits;

use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;

trait OneLineTrait
{
    #[Section('configuration')]
    #[Input\Boolean('Show all options on one line')]
    protected bool $oneLine = false;

    public function isOneLine(): bool
    {
        return $this->oneLine;
    }
}
