<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Countries;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\PredefinedSourceTypeInterface;

class Countries implements PredefinedSourceTypeInterface
{
    #[Select(
        label: 'Option Label',
        options: [
            self::DISPLAY_ABBREVIATED => 'Abbreviated',
            self::DISPLAY_FULL => 'Full',
        ],
    )]
    private string $label = self::DISPLAY_FULL;

    #[Select(
        label: 'Option Value',
        options: [
            self::DISPLAY_ABBREVIATED => 'Abbreviated',
            self::DISPLAY_FULL => 'Full',
        ],
    )]
    private string $value = self::DISPLAY_ABBREVIATED;

    public function getName(): string
    {
        return 'Countries';
    }

    public function generateOptions(): OptionCollection
    {
        static $countries;
        if (null === $countries) {
            $countries = json_decode(file_get_contents(__DIR__.'/countries.json'), true);
        }

        $collection = new OptionCollection();
        foreach ($countries as $code => $name) {
            $collection->add(
                self::DISPLAY_FULL === $this->value ? $name : $code,
                self::DISPLAY_FULL === $this->label ? $name : $code,
            );
        }

        return $collection;
    }
}
