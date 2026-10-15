<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Industries;

use Solspace\Freeform\Fields\Properties\Options\Predefined\TranslatedOptions;

class Industries extends TranslatedOptions
{
    public function getName(): string
    {
        return 'Industries';
    }

    protected function getItems(): array
    {
        static $items;
        if (null === $items) {
            $items = json_decode(file_get_contents(__DIR__.'/industries.json'), true, 512, \JSON_THROW_ON_ERROR);
        }

        return $items;
    }
}
