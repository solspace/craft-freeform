<?php

namespace Solspace\Freeform\Tests\Library\Forms;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Properties\Options\Custom\Custom;
use Solspace\Freeform\Library\Forms\Merge\FieldMapping;

#[CoversClass(FieldMapping::class)]
class FieldMappingTest extends TestCase
{
    public function testMappingsRequireCompatibleStorageAndRejectEncryptedFields(): void
    {
        $text = $this->field(TextField::class);
        $textarea = $this->field(TextareaField::class);
        $number = $this->field(NumberField::class);

        self::assertTrue(FieldMapping::compatible($text, $textarea));
        self::assertFalse(FieldMapping::compatible($text, $number));

        (new \ReflectionProperty($text, 'encrypted'))->setValue($text, true);
        self::assertFalse(FieldMapping::canAdd($text));
        self::assertFalse(FieldMapping::compatible($text, $textarea));
    }

    public function testRejectsChoiceValuesThePrimaryCannotRepresent(): void
    {
        $dropdown = $this->field(DropdownField::class);
        $checkboxes = $this->field(CheckboxesField::class);
        $configuration = new Custom(['options' => [
            ['label' => 'Zero', 'value' => '0'],
            ['label' => 'Group header', 'value' => 'header', 'optgroup' => true],
            ['label' => 'Blue', 'value' => 'blue'],
        ]]);
        (new \ReflectionProperty($dropdown, 'optionConfiguration'))->setValue($dropdown, $configuration);
        (new \ReflectionProperty($checkboxes, 'optionConfiguration'))->setValue($checkboxes, $configuration);

        $validateDropdown = FieldMapping::storedValueValidator($dropdown);
        $validateCheckboxes = FieldMapping::storedValueValidator($checkboxes);
        self::assertTrue($validateDropdown('0'));
        self::assertFalse($validateDropdown('header'));
        self::assertTrue($validateCheckboxes('[0,"blue"]'));
        self::assertFalse($validateCheckboxes('["removed"]'));
        self::assertFalse($validateCheckboxes('{"0":"blue"}'));
        self::assertFalse(FieldMapping::populated($checkboxes, '[]'));
        self::assertTrue(FieldMapping::populated($dropdown, '0'));
    }

    public function testOptionMergeKeepsReceivingChoicesAndAddsUniqueStoredValues(): void
    {
        $source = $this->field(DropdownField::class);
        $target = $this->field(DropdownField::class);
        $sourceConfiguration = new Custom(['options' => [
            ['label' => 'Alternate label', 'value' => 'shared'],
            ['label' => 'Zero', 'value' => '0'],
            ['label' => 'Duplicate zero', 'value' => '0'],
            ['label' => 'Placeholder', 'value' => ''],
            ['label' => 'Group', 'value' => 'group', 'optgroup' => true],
            ['label' => 'Workshop', 'value' => 'Workshop'],
        ]]);
        $targetConfiguration = new Custom(['options' => [
            ['label' => 'Receiving label', 'value' => 'shared'],
            ['label' => 'Other', 'value' => 'Other'],
        ]]);
        (new \ReflectionProperty($source, 'optionConfiguration'))->setValue($source, $sourceConfiguration);
        (new \ReflectionProperty($target, 'optionConfiguration'))->setValue($target, $targetConfiguration);

        $rows = [1 => ['targets' => [10 => 'Example'], 'optionTargets' => [10 => true], 'label' => 'Example']];
        self::assertSame([1 => '10'], FieldMapping::validate([1 => 'options:10'], $rows, []));
        $additions = FieldMapping::optionAdditions($source, $target);
        self::assertSame(['Zero', 'Workshop'], array_column($additions, 'label'));
        self::assertFalse(FieldMapping::storedValueValidator($target)('0'));
        self::assertTrue(FieldMapping::storedValueValidator($target, $additions)('0'));
        self::assertFalse(FieldMapping::storedValueValidator($target, $additions)('retired'));

        $merged = FieldMapping::appendOptions($targetConfiguration->toArray(), $additions);
        self::assertSame(['Receiving label', 'Other', 'Zero', 'Workshop'], array_column($merged['options'], 'label'));
        self::assertSame(['shared', 'Other', '0', 'Workshop'], array_column($merged['options'], 'value'));
        self::assertTrue($merged['useCustomValues']);

        (new \ReflectionProperty($target, 'optionConfiguration'))->setValue($target, new Custom($merged));
        self::assertSame([], FieldMapping::optionAdditions($source, $target));
        $this->expectException(\DomainException::class);
        $rows[1]['optionTargets'] = [];
        FieldMapping::validate([1 => 'options:10'], $rows, []);
    }

    public function testAddsAndSkipsWithoutAssigningTheSameTargetTwice(): void
    {
        $rows = [
            1 => ['canAdd' => true, 'targets' => [10 => 'Text'], 'label' => 'First'],
            2 => ['canAdd' => true, 'targets' => [10 => 'Text'], 'label' => 'Second'],
            3 => ['canAdd' => false, 'targets' => [], 'label' => 'Third'],
        ];
        $pages = [20 => 'Page 1'];

        self::assertSame([1 => '10', 2 => 'add:20'], FieldMapping::validate(
            [1 => '10', 2 => 'add:20', 3 => 'skip'],
            $rows,
            $pages,
        ));

        $this->expectException(\DomainException::class);
        FieldMapping::validate([1 => '10', 2 => '10', 3 => 'skip'], $rows, $pages);
    }

    public function testRejectsARequestMissingAnyFieldChoice(): void
    {
        $this->expectException(\DomainException::class);
        FieldMapping::validate([], [1 => ['canAdd' => true, 'targets' => [], 'label' => 'Text']], [20 => 'Page 1']);
    }

    private function field(string $class): FieldInterface
    {
        $field = (new \ReflectionClass($class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty($class, 'handle'))->setValue($field, 'example');

        return $field;
    }
}
