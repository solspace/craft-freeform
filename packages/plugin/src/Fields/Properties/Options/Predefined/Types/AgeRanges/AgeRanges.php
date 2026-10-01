<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\AgeRanges;

use Solspace\Freeform\Fields\Properties\Options\Predefined\TranslatedOptions;

class AgeRanges extends TranslatedOptions
{
    public function getName(): string
    {
        return 'Age Ranges';
    }

    protected function getItems(): array
    {
        static $items;
        if (null === $items) {
            $items = json_decode(file_get_contents(__DIR__.'/age-ranges.json'), true, 512, \JSON_THROW_ON_ERROR);
        }

        return $items;
    }
}
