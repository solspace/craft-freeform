<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Currencies;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\PredefinedSourceTypeInterface;

class Currencies implements PredefinedSourceTypeInterface
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
        return 'Currencies';
    }

    public function generateOptions(): OptionCollection
    {
        static $countries;
        if (null === $countries) {
            $countries = json_decode(file_get_contents(__DIR__.'/currencies.json'), true);
        }

        $collection = new OptionCollection();
        foreach ($countries as $code => $data) {
            $collection->add(
                self::DISPLAY_FULL === $this->value ? $data['name'] : $code,
                self::DISPLAY_FULL === $this->label ? $data['name'] : $code,
            );
        }

        return $collection;
    }
}
