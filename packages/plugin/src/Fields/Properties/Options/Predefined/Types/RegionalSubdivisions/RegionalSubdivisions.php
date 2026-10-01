<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\RegionalSubdivisions;

use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Fields\Properties\Options\Predefined\TranslatedOptions;

class RegionalSubdivisions extends TranslatedOptions
{
    #[Select(
        label: 'Country',
        instructions: 'Choose a country to list its states, regions, provinces, or constituent countries.',
        order: 0,
        options: [
            'AU' => 'Australia',
            'DE' => 'Germany',
            'FR' => 'France',
            'IT' => 'Italy',
            'NL' => 'Netherlands',
            'GB' => 'United Kingdom',
        ],
    )]
    private string $country = 'AU';

    public function getName(): string
    {
        return 'Regional Subdivisions';
    }

    protected function getItems(): array
    {
        static $items;
        if (null === $items) {
            $items = json_decode(file_get_contents(__DIR__.'/regional-subdivisions.json'), true, 512, \JSON_THROW_ON_ERROR);
        }

        return $items[$this->country] ?? [];
    }
}
