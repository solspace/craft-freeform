<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Currencies;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\PredefinedSourceTypeInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Translations\TranslationTable;

class Currencies implements PredefinedSourceTypeInterface
{
    #[Select(
        label: 'Option Label',
        options: [
            self::DISPLAY_ABBREVIATED => 'Abbreviated',
            self::DISPLAY_FULL => 'Full',
            self::DISPLAY_FULL_TRANSLATED => 'Full (translated)',
        ],
    )]
    private string $label = self::DISPLAY_FULL_TRANSLATED;

    #[Select(
        label: 'Option Value',
        options: [
            self::DISPLAY_ABBREVIATED => 'Abbreviated',
            self::DISPLAY_FULL => 'Full',
            self::DISPLAY_FULL_TRANSLATED => 'Full (translated)',
        ],
    )]
    private string $value = self::DISPLAY_ABBREVIATED;

    public function getName(): string
    {
        return 'Currencies';
    }

    public function generateOptions(?TranslationTable $translationTable = null): OptionCollection
    {
        static $countries;
        if (null === $countries) {
            $countries = json_decode(file_get_contents(__DIR__.'/currencies.json'), true);
        }

        $collection = new OptionCollection();
        foreach ($countries as $code => $data) {
            $value = match ($this->value) {
                self::DISPLAY_FULL => $data['name'],
                self::DISPLAY_FULL_TRANSLATED => Freeform::t($data['name']),
                default => $code,
            };

            $label = match ($this->label) {
                self::DISPLAY_FULL => $data['name'],
                self::DISPLAY_FULL_TRANSLATED => Freeform::t($data['name']),
                default => $code,
            };

            $collection->add($value, $label);
        }

        return $collection;
    }
}
