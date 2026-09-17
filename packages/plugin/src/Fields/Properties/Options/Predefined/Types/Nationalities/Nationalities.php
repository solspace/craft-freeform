<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Nationalities;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\PredefinedSourceTypeInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Translations\TranslationTable;

class Nationalities implements PredefinedSourceTypeInterface
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
        return 'Nationalities';
    }

    public function generateOptions(?TranslationTable $translationTable = null): OptionCollection
    {
        static $nationalities;
        if (null === $nationalities) {
            $nationalities = json_decode(file_get_contents(__DIR__.'/nationalities.json'), true);
        }

        $collection = new OptionCollection();
        foreach ($nationalities as $code => $nationality) {
            $value = match ($this->value) {
                self::DISPLAY_FULL => $nationality,
                self::DISPLAY_FULL_TRANSLATED => $this->translate($nationality),
                default => $code,
            };

            $label = match ($this->label) {
                self::DISPLAY_FULL => $nationality,
                self::DISPLAY_FULL_TRANSLATED => $this->translate($nationality),
                default => $code,
            };

            $collection->add($value, $label);
        }

        return $collection;
    }

    private function translate(string $nationality): string
    {
        $key = "Nationality: {$nationality}";
        $translation = Freeform::t($key);

        return $translation === $key ? $nationality : $translation;
    }
}
