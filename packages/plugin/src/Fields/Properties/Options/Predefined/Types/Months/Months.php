<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Months;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\PredefinedSourceTypeInterface;

class Months implements PredefinedSourceTypeInterface
{
    private const DISPLAY_SINGLE_DIGIT = 'single';
    private const DISPLAY_DOUBLE_DIGIT = 'double';

    #[Select(
        label: 'Option Label',
        options: [
            self::DISPLAY_FULL => 'Full',
            self::DISPLAY_ABBREVIATED => 'Abbreviated',
            self::DISPLAY_SINGLE_DIGIT => 'Single number',
            self::DISPLAY_DOUBLE_DIGIT => '2-digit number',
        ],
    )]
    private string $label = self::DISPLAY_FULL;

    #[Select(
        label: 'Option Value',
        options: [
            self::DISPLAY_FULL => 'Full',
            self::DISPLAY_ABBREVIATED => 'Abbreviated',
            self::DISPLAY_SINGLE_DIGIT => 'Single number',
            self::DISPLAY_DOUBLE_DIGIT => '2-digit number',
        ],
    )]
    private string $value = self::DISPLAY_FULL;

    public function getName(): string
    {
        return 'Months';
    }

    public function generateOptions(): OptionCollection
    {
        $collection = new OptionCollection();

        $valueFormat = $this->getFormat($this->value);
        $labelFormat = $this->getFormat($this->label);

        foreach (range(0, 11) as $month) {
            $value = date($valueFormat, strtotime("january 2000 +{$month} month"));
            $label = date($labelFormat, strtotime("january 2000 +{$month} month"));

            $collection->add($value, $label);
        }

        return $collection;
    }

    private function getFormat(string $display): string
    {
        return match ($display) {
            self::DISPLAY_SINGLE_DIGIT => 'n',
            self::DISPLAY_DOUBLE_DIGIT => 'm',
            self::DISPLAY_ABBREVIATED => 'M',
            default => 'F',
        };
    }
}
