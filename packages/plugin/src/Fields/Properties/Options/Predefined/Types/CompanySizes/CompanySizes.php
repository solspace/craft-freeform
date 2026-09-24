<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\CompanySizes;

use Solspace\Freeform\Fields\Properties\Options\Predefined\TranslatedOptions;

class CompanySizes extends TranslatedOptions
{
    public function getName(): string
    {
        return 'Company Sizes';
    }

    protected function getItems(): array
    {
        static $items;
        if (null === $items) {
            $items = json_decode(file_get_contents(__DIR__.'/company-sizes.json'), true, 512, \JSON_THROW_ON_ERROR);
        }

        return $items;
    }
}
