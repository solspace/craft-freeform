<?php

namespace Solspace\Freeform\Tests\Fields\Properties\Options\Predefined;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Predefined;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\TimeIntervals\TimeIntervals;
use Solspace\Freeform\Library\Translations\TranslationTable;

#[CoversClass(TimeIntervals::class)]
class TimeIntervalsTest extends TestCase
{
    #[DataProvider('provideRanges')]
    public function testRanges(string $start, string $end, int $interval, int $count, string $last): void
    {
        $source = $this->createSource(['startTime' => $start, 'endTime' => $end, 'interval' => $interval]);
        $options = $source->generateOptions()->toArray();
        $this->assertCount($count, $options);
        $this->assertSame($start, $options[0]['value']);
        $this->assertSame($last, $options[$count - 1]['value']);
        $this->assertSame(array_column($options, 'value'), array_column($options, 'label'));
    }

    public static function provideRanges(): iterable
    {
        yield 'default half hours' => ['09:00', '17:00', 30, 17, '17:00'];

        yield 'full day quarter hours' => ['00:00', '23:59', 15, 96, '23:45'];

        yield 'hourly' => ['09:00', '17:00', 60, 9, '17:00'];

        yield 'non-aligned end' => ['09:10', '10:00', 30, 2, '09:40'];

        yield 'single time' => ['12:00', '12:00', 15, 1, '12:00'];

        yield 'end of day' => ['23:59', '23:59', 60, 1, '23:59'];
    }

    #[DataProvider('provideInvalidSettings')]
    public function testInvalidSettingsDoNotGenerateOptions(array $settings): void
    {
        $this->assertCount(0, $this->createSource($settings)->generateOptions());
    }

    public static function provideInvalidSettings(): iterable
    {
        yield 'empty' => [['startTime' => '']];

        yield 'invalid hour' => [['startTime' => '24:00']];

        yield 'invalid minute' => [['endTime' => '17:60']];

        yield 'missing zero' => [['startTime' => '9:00']];

        yield 'trailing newline' => [['startTime' => "09:00\n"]];

        yield 'trailing text' => [['endTime' => '17:00abc']];

        yield 'overnight' => [['startTime' => '22:00', 'endTime' => '02:00']];

        yield 'zero interval' => [['interval' => 0]];

        yield 'negative interval' => [['interval' => -15]];

        yield 'unsupported interval' => [['interval' => 1]];
    }

    public function testTwelveHourLabelsPreserveValuesAtMidnightAndNoon(): void
    {
        $source = $this->createSource(['startTime' => '00:00', 'endTime' => '13:00', 'interval' => 60, 'format' => '12']);
        $options = $source->generateOptions();
        $this->assertSame('12:00 AM', $options->getOption('00:00')->getLabel());
        $this->assertSame('12:00 PM', $options->getOption('12:00')->getLabel());
        $this->assertSame('1:00 PM', $options->getOption('13:00')->getLabel());
    }

    public function testBuilderSettingsRoundTripWithStringInterval(): void
    {
        $propertyProvider = $this->getMockBuilder(PropertyProvider::class)
            ->disableOriginalConstructor()
            ->onlyMethods([])
            ->getMock()
        ;
        $config = [
            'typeClass' => TimeIntervals::class,
            'properties' => ['startTime' => '11:45', 'endTime' => '12:15', 'interval' => '15', 'format' => '12'],
        ];
        $source = new Predefined($config, $propertyProvider);
        $saved = json_decode(json_encode($source->toArray(), \JSON_THROW_ON_ERROR), true, 512, \JSON_THROW_ON_ERROR);
        $restored = new Predefined($saved, $propertyProvider);
        $this->assertSame([
            ['value' => '11:45', 'label' => '11:45 AM'],
            ['value' => '12:00', 'label' => '12:00 PM'],
            ['value' => '12:15', 'label' => '12:15 PM'],
        ], $restored->getOptions(new TranslationTable())->toArray());
    }

    private function createSource(array $settings): TimeIntervals
    {
        $source = new TimeIntervals();
        foreach ($settings as $key => $value) {
            (new \ReflectionProperty($source, $key))->setValue($source, $value);
        }

        return $source;
    }
}
