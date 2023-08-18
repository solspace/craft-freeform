<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\DaysOfWeek;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\PredefinedSourceTypeInterface;

class DaysOfWeek implements PredefinedSourceTypeInterface
{
    private const DISPLAY_SINGLE_DIGIT = 'single';
    private const DISPLAY_DOUBLE_DIGIT = 'double';

    #[Select(
        label: 'Option Label',
        options: [
            self::DISPLAY_FULL => 'Full',
            self::DISPLAY_ABBREVIATED => 'Abbreviated',
            self::DISPLAY_SINGLE_DIGIT => 'Single number',
        ],
    )]
    private string $label = self::DISPLAY_FULL;

    #[Select(
        label: 'Option Value',
        options: [
            self::DISPLAY_FULL => 'Full',
            self::DISPLAY_ABBREVIATED => 'Abbreviated',
            self::DISPLAY_SINGLE_DIGIT => 'Single number',
        ],
    )]
    private string $value = self::DISPLAY_FULL;

    public function getName(): string
    {
        return 'Days of Week';
    }

    public function generateOptions(): OptionCollection
    {
        $collection = new OptionCollection();

        $valueFormat = $this->getFormat($this->value);
        $labelFormat = $this->getFormat($this->label);

        foreach (range(0, 6) as $dayIndex) {
            $value = date($valueFormat, strtotime("Sunday +{$dayIndex} days"));
            $label = date($labelFormat, strtotime("Sunday +{$dayIndex} days"));

            $collection->add($value, $label);
        }

        return $collection;
    }

    private function getFormat(string $display): string
    {
        return match ($display) {
            self::DISPLAY_SINGLE_DIGIT => 'N',
            self::DISPLAY_ABBREVIATED => 'D',
            default => 'l',
        };
    }
}
