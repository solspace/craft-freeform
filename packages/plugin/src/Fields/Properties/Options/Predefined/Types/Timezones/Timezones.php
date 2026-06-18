<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Timezones;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\PredefinedSourceTypeInterface;
use Solspace\Freeform\Library\Translations\TranslationTable;

class Timezones implements PredefinedSourceTypeInterface
{
    #[Select(
        label: 'Option Label',
        options: [
            self::DISPLAY_ABBREVIATED => 'Identifier',
            self::DISPLAY_FULL => 'Display Name',
        ],
    )]
    private string $label = self::DISPLAY_FULL;

    #[Select(
        label: 'Option Value',
        options: [
            self::DISPLAY_ABBREVIATED => 'Identifier',
            self::DISPLAY_FULL => 'Display Name',
        ],
    )]
    private string $value = self::DISPLAY_ABBREVIATED;

    public function getName(): string
    {
        return 'Timezones';
    }

    public function generateOptions(?TranslationTable $translationTable = null): OptionCollection
    {
        $collection = new OptionCollection();

        foreach ($this->getTimezones() as $timezoneValue => $timezoneLabel) {
            $formattedLabel = $this->getTimezoneLabel($timezoneValue, $timezoneLabel);

            $value = match ($this->value) {
                self::DISPLAY_FULL => $formattedLabel,
                default => $timezoneValue,
            };

            $label = match ($this->label) {
                self::DISPLAY_ABBREVIATED => $timezoneValue,
                default => $formattedLabel,
            };

            $collection->add($value, $label);
        }

        return $collection;
    }

    private function getTimezones(): array
    {
        static $timezones;

        if (null !== $timezones) {
            return $timezones;
        }

        $timezones = [];

        foreach (\DateTimeZone::listIdentifiers() as $timezoneValue) {
            $timezones[$timezoneValue] = $this->getReadableTimezoneName($timezoneValue);
        }

        ksort($timezones);

        return $timezones;
    }

    private function getReadableTimezoneName(string $timezoneValue): string
    {
        if ('UTC' === $timezoneValue) {
            return 'UTC';
        }

        $parts = explode('/', $timezoneValue);
        $name = end($parts);

        return str_replace('_', ' ', $name);
    }

    private function getTimezoneLabel(string $timezoneValue, string $timezoneLabel): string
    {
        $timezone = new \DateTimeZone($timezoneValue);
        $offset = $timezone->getOffset(new \DateTime('now', $timezone));

        $sign = $offset >= 0 ? '+' : '-';
        $offset = abs($offset);

        $hours = floor($offset / 3600);
        $minutes = floor(($offset % 3600) / 60);

        return \sprintf(
            '(UTC%s%02d:%02d) %s',
            $sign,
            $hours,
            $minutes,
            $timezoneLabel,
        );
    }
}
