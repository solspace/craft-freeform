<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\EmploymentStatuses;

use Solspace\Freeform\Fields\Properties\Options\Predefined\TranslatedOptions;

class EmploymentStatuses extends TranslatedOptions
{
    public function getName(): string
    {
        return 'Employment Statuses';
    }

    protected function getItems(): array
    {
        static $items;
        if (null === $items) {
            $items = json_decode(file_get_contents(__DIR__.'/employment-statuses.json'), true, 512, \JSON_THROW_ON_ERROR);
        }

        return $items;
    }
}
