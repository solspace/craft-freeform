<?php

namespace Solspace\Freeform\Library\Composer\Components\Fields\Traits;

use Solspace\Freeform\Attributes\Field\EditableProperty;

trait OneLineTrait
{
    #[EditableProperty(
        label: 'Show all options in a single line?',
    )]
    protected bool $oneLine = false;

    public function isOneLine(): bool
    {
        return $this->oneLine;
    }
}
