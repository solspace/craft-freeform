<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Days;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\PredefinedSourceTypeInterface;

class Days implements PredefinedSourceTypeInterface
{
    private const DISPLAY_SINGLE_DIGIT = 'single';
    private const DISPLAY_DOUBLE_DIGIT = 'double';

    #[Select(
        label: 'Option Label',
        options: [
            self::DISPLAY_SINGLE_DIGIT => 'Single number',
            self::DISPLAY_DOUBLE_DIGIT => '2-digit number',
        ],
    )]
    private string $label = self::DISPLAY_SINGLE_DIGIT;

    #[Select(
        label: 'Option Value',
        options: [
            self::DISPLAY_SINGLE_DIGIT => 'Single number',
            self::DISPLAY_DOUBLE_DIGIT => '2-digit number',
        ],
    )]
    private string $value = self::DISPLAY_SINGLE_DIGIT;

    public function getName(): string
    {
        return 'Days';
    }

    public function generateOptions(): OptionCollection
    {
        $collection = new OptionCollection();
        foreach (range(1, 31) as $dayIndex) {
            $labelLength = self::DISPLAY_SINGLE_DIGIT === $this->label ? 1 : 2;
            $valueLength = self::DISPLAY_SINGLE_DIGIT === $this->value ? 1 : 2;

            $label = str_pad($dayIndex, $labelLength, '0', \STR_PAD_LEFT);
            $value = str_pad($dayIndex, $valueLength, '0', \STR_PAD_LEFT);

            $collection->add($value, $label);
        }

        return $collection;
    }
}
