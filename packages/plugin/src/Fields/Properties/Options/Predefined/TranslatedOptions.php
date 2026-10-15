<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\PredefinedSourceTypeInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Translations\TranslationTable;

abstract class TranslatedOptions implements PredefinedSourceTypeInterface
{
    #[Select(
        label: 'Option Label',
        order: 10,
        options: [
            self::DISPLAY_FULL => 'Full',
            self::DISPLAY_FULL_TRANSLATED => 'Full (translated)',
        ],
    )]
    protected string $label = self::DISPLAY_FULL_TRANSLATED;

    #[Select(
        label: 'Option Value',
        order: 11,
        options: [
            self::DISPLAY_ABBREVIATED => 'Identifier',
            self::DISPLAY_FULL => 'Full',
            self::DISPLAY_FULL_TRANSLATED => 'Full (translated)',
        ],
    )]
    protected string $value = self::DISPLAY_ABBREVIATED;

    public function generateOptions(?TranslationTable $translationTable = null): OptionCollection
    {
        $collection = new OptionCollection();

        foreach ($this->getItems() as $identifier => $name) {
            $value = match ($this->value) {
                self::DISPLAY_FULL => $name,
                self::DISPLAY_FULL_TRANSLATED => Freeform::t($name),
                default => (string) $identifier,
            };

            $label = match ($this->label) {
                self::DISPLAY_FULL => $name,
                default => Freeform::t($name),
            };

            $collection->add($value, $label);
        }

        return $collection;
    }

    /** @return array<int|string, string> */
    abstract protected function getItems(): array;
}
