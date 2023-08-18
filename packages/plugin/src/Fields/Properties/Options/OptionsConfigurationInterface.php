<?php

namespace Solspace\Freeform\Fields\Properties\Options;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;

interface OptionsConfigurationInterface
{
    public const SOURCE_CUSTOM = 'custom';
    public const SOURCE_ELEMENTS = 'elements';
    public const SOURCE_PREDEFINED = 'predefined';

    public function getSource(): string;

    public function getOptions(): OptionCollection;

    public function toArray(): array;
}
