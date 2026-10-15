<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\TimeIntervals;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Attributes\Property\Input\Text;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\PredefinedSourceTypeInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Translations\TranslationTable;

class TimeIntervals implements PredefinedSourceTypeInterface
{
    #[Text(
        label: 'Start Time',
        instructions: 'Enter a time in 24-hour HH:MM format, e.g. 09:00.',
    )]
    private string $startTime = '09:00';

    #[Text(
        label: 'End Time',
        instructions: 'Enter a time in 24-hour HH:MM format, e.g. 17:00. Must be on the same day and at or after the start time.',
    )]
    private string $endTime = '17:00';

    #[Select(
        label: 'Interval',
        options: [15 => '15 minutes', 30 => '30 minutes', 60 => '60 minutes'],
    )]
    private int $interval = 30;

    #[Select(
        label: 'Time Label Format',
        instructions: 'Stored values always use 24-hour HH:MM format. These options do not check appointment availability.',
        options: ['24' => '24-hour', '12' => '12-hour'],
    )]
    private string $format = '24';

    public function getName(): string
    {
        return 'Time Intervals';
    }

    public function generateOptions(?TranslationTable $translationTable = null): OptionCollection
    {
        $collection = new OptionCollection();
        $start = $this->parseTime($this->startTime);
        $end = $this->parseTime($this->endTime);

        // Invalid settings must not generate unexpected options or unbounded ranges.
        if (null === $start || null === $end || $start > $end || !\in_array($this->interval, [15, 30, 60], true)) {
            return $collection;
        }

        for ($minutes = $start; $minutes <= $end; $minutes += $this->interval) {
            $hour = intdiv($minutes, 60);
            $minute = $minutes % 60;
            $value = \sprintf('%02d:%02d', $hour, $minute);
            $label = $value;

            if ('12' === $this->format) {
                $label = \sprintf('%d:%02d %s', $hour % 12 ?: 12, $minute, Freeform::t($hour < 12 ? 'AM' : 'PM'));
            }

            $collection->add($value, $label);
        }

        return $collection;
    }

    private function parseTime(string $time): ?int
    {
        if (!preg_match('/\A([01][0-9]|2[0-3]):([0-5][0-9])\z/', $time, $matches)) {
            return null;
        }

        return (int) $matches[1] * 60 + (int) $matches[2];
    }
}
