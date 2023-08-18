<?php

namespace Solspace\Freeform\Fields\Properties\Options;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;

interface OptionTypeProviderInterface
{
    public function getName(): string;

    public function generateOptions(): OptionCollection;
}
