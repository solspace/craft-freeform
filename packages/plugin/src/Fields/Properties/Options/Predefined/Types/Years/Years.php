<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Years;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input\Integer;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\PredefinedSourceTypeInterface;

class Years implements PredefinedSourceTypeInterface
{
    #[Integer('First value from current year')]
    private ?int $first = 0;

    #[Integer('Last value from current year')]
    private ?int $last = -100;

    public function getName(): string
    {
        return 'Years';
    }

    public function generateOptions(): OptionCollection
    {
        $currentYear = (int) date('Y');
        $first = $this->first ?? 0;
        $last = $this->last ?? -100;

        $collection = new OptionCollection();

        $range = range($currentYear + $first, $currentYear + $last);
        foreach ($range as $year) {
            $collection->add($year, $year);
        }

        return $collection;
    }
}
