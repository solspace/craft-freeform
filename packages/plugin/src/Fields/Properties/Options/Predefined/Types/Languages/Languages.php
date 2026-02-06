<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Languages;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input\Boolean;
use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\PredefinedSourceTypeInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Translations\TranslationTable;

class Languages implements PredefinedSourceTypeInterface
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

    #[Boolean]
    private bool $useNativeName = false;

    public function getName(): string
    {
        return 'Languages';
    }

    public function generateOptions(?TranslationTable $translationTable = null): OptionCollection
    {
        static $languages;
        if (null === $languages) {
            $languages = json_decode(file_get_contents(__DIR__.'/languages.json'), true);
        }

        $dataProperty = $this->useNativeName ? 'nativeName' : 'name';

        $collection = new OptionCollection();
        foreach ($languages as $code => $data) {
            $value = match ($this->value) {
                self::DISPLAY_FULL => $data[$dataProperty],
                self::DISPLAY_FULL_TRANSLATED => Freeform::t($data[$dataProperty]),
                default => $code,
            };

            $label = match ($this->label) {
                self::DISPLAY_FULL => $data[$dataProperty],
                self::DISPLAY_FULL_TRANSLATED => Freeform::t($data[$dataProperty]),
                default => $code,
            };

            $collection->add($value, $label);
        }

        return $collection;
    }
}
