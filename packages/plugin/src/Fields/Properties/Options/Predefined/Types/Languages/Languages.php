<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Languages;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input\Boolean;
use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\PredefinedSourceTypeInterface;

class Languages implements PredefinedSourceTypeInterface
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

    #[Boolean]
    private bool $useNativeName = false;

    public function getName(): string
    {
        return 'Languages';
    }

    public function generateOptions(): OptionCollection
    {
        static $languages;
        if (null === $languages) {
            $languages = json_decode(file_get_contents(__DIR__.'/languages.json'), true);
        }

        $dataProperty = $this->useNativeName ? 'nativeName' : 'name';

        $collection = new OptionCollection();
        foreach ($languages as $code => $data) {
            $collection->add(
                self::DISPLAY_FULL === $this->value ? $data[$dataProperty] : $code,
                self::DISPLAY_FULL === $this->label ? $data[$dataProperty] : $code,
            );
        }

        return $collection;
    }
}
