<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Types;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;

interface ElementSourceTypeInterface
{
    public function getTypeClass(): string;

    public function getElementName(): string;

    public function generateOptions(): OptionCollection;
}
