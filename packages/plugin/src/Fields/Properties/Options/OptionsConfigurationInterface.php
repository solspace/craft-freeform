<?php

namespace Solspace\Freeform\Fields\Properties\Options;

interface OptionsConfigurationInterface
{
    public const SOURCE_CUSTOM = 'custom';
    public const SOURCE_ELEMENTS = 'elements';
    public const SOURCE_PREDEFINED = 'predefined';

    public function getSource(): string;

    public function toArray(): array;
}
