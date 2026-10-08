<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Continents;

use Solspace\Freeform\Fields\Properties\Options\Predefined\TranslatedOptions;

class Continents extends TranslatedOptions
{
    public function getName(): string
    {
        return 'Continents';
    }

    protected function getItems(): array
    {
        static $items;
        if (null === $items) {
            $items = json_decode(file_get_contents(__DIR__.'/continents.json'), true, 512, \JSON_THROW_ON_ERROR);
        }

        return $items;
    }
}
