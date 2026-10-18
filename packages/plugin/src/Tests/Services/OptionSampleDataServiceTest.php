<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Services\OptionSampleDataService;

#[CoversClass(OptionSampleDataService::class)]
class OptionSampleDataServiceTest extends TestCase
{
    public function testChoosesOnlyUniqueNonemptyOptionsIncludingNestedGroupsAndZero(): void
    {
        $options = (new OptionCollection())->add('', 'Choose...')->add('0', 'Zero');
        $options->addCollection((new OptionCollection('Group'))->add('a', 'A')->add('b', 'B')->add('a', 'Duplicate'));
        $service = new OptionSampleDataService();
        for ($i = 0; $i < 20; ++$i) {
            self::assertContains($service->select($options, false), ['0', 'a', 'b']);
            $values = $service->select($options, true);
            self::assertContains(\count($values), [2, 3]);
            self::assertSame($values, array_values(array_unique($values)));
            self::assertEmpty(array_diff($values, ['0', 'a', 'b']));
        }
        self::assertEqualsCanonicalizing(['0', 'a', 'b'], $service->select($options, true, \PHP_INT_MAX, \PHP_INT_MAX));
    }

    public function testHandlesEmptyAndSmallListsAndSelectionLimits(): void
    {
        $service = new OptionSampleDataService();
        self::assertSame('', $service->select(new OptionCollection(), false));
        self::assertSame([], $service->select(new OptionCollection(), true));
        $options = (new OptionCollection())->add('a', 'A');
        self::assertSame(['a'], $service->select($options, true));
        self::assertSame([], $service->select($options, true, 2, 0));
        $options->add('b', 'B')->add('c', 'C')->add('d', 'D');
        self::assertCount(1, $service->select($options, true, 2, 1));
        self::assertCount(4, $service->select($options, true, 4, 4));
    }

    public function testKeepsDefaultsStableAcrossContextEventsAndRespectsCheckboxLimits(): void
    {
        $options = (new OptionCollection())->add('a', 'A')->add('b', 'B')->add('c', 'C')->add('d', 'D');
        $field = $this->createMock(DropdownField::class);
        $field->expects(self::once())->method('getOptions')->willReturn($options);
        $service = new OptionSampleDataService();
        $value = $service->getValue($field);
        self::assertSame($value, $service->getValue($field));

        $checkboxes = $this->createMock(CheckboxesField::class);
        $checkboxes->method('getOptions')->willReturn($options);
        $checkboxes->method('getLimit')->willReturn(CheckboxesField::LIMIT_MAXIMUM);
        $checkboxes->method('getLimitMax')->willReturn(1);
        self::assertCount(1, $service->getValue($checkboxes));

        $all = $this->createMock(CheckboxesField::class);
        $all->method('getOptions')->willReturn($options);
        $all->method('getLimit')->willReturn(CheckboxesField::LIMIT_REQUIRE_ALL);
        self::assertCount(4, $service->getValue($all));
    }
}
