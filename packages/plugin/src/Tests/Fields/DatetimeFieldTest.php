<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\Validation\DateValidation;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Translations\TranslationTable;
use Twig\Markup;

#[CoversClass(DatetimeField::class)]
#[CoversClass(DateValidation::class)]
class DatetimeFieldTest extends TestCase
{
    #[DataProvider('nativeValues')]
    public function testRestoredNativeValuesRenderAndParse(string $type, string $value, string $inputType): void
    {
        $field = $this->createField($type);
        // Page navigation restores the previously submitted string via setValue().
        $field->setValue($value);

        $this->assertSame($value, $field->getValue());
        $this->assertNotNull($field->getCarbon());
        $this->assertNotNull($field->getCarbonUtc());
        $this->assertSame($value, $field->getCarbon()->format($field->getNativeFormat()));
        $this->assertSame($value, $field->getCarbonUtc()->format($field->getNativeFormat()));
        $this->assertSame('UTC', $field->getCarbonUtc()->getTimezone()->getName());
        $this->assertInput($field, $inputType, $value);

        $this->getValidation()->validateFormat(new ValidateEvent($field->getForm(), $field));
        $this->assertSame([], $field->getErrors());
    }

    #[DataProvider('nativeValues')]
    public function testNativeInitialValuesAndDateObjectsUseBrowserFormat(string $type, string $value, string $inputType): void
    {
        $field = $this->createField($type);
        (new \ReflectionProperty(DatetimeField::class, 'initialValue'))->setValue($field, '2026-10-09 16:35:00');

        $this->assertSame($value, $field->getValue());
        $this->assertInput($field, $inputType, $value);

        $field->setValue(new \DateTime('2026-10-09 16:35:00'));
        $this->assertSame($value, $field->getValue());
        $this->assertInput($field, $inputType, $value);
    }

    #[DataProvider('customValues')]
    public function testTextInputsKeepTheirConfiguredFormat(string $type, string $value): void
    {
        $field = $this->createField($type, false);
        $field->setValue($value);

        $this->assertSame($value, $field->getCarbon()->format($field->getFormat()));
        $this->assertSame($value, $field->getCarbonUtc()->format($field->getFormat()));
        $this->assertInput($field, 'text', $value);

        $field->setValue(new \DateTime('2026-10-09 16:35:00'));
        $this->assertSame($value, $field->getValue());
    }

    public static function customValues(): array
    {
        return [
            ['date', '09/10/2026'],
            ['time', '4:35 PM'],
            ['both', '09/10/2026 4:35 PM'],
        ];
    }

    #[DataProvider('nativeDateBounds')]
    public function testNativeDateBoundsUseTheSubmittedFormat(string $type, string $value, bool $hasErrors): void
    {
        $field = $this->createField($type);
        $field->setValue($value);
        (new \ReflectionProperty(DatetimeField::class, 'minDate'))->setValue($field, '2026-10-08');
        (new \ReflectionProperty(DatetimeField::class, 'maxDate'))->setValue($field, '2026-10-10');

        $validation = $this->getValidation();
        $event = new ValidateEvent($field->getForm(), $field);
        $validation->validateMinDate($event);
        $validation->validateMaxDate($event);

        $this->assertSame($hasErrors, !empty($field->getErrors()));
        $input = $this->getInput($field);
        $this->assertSame('2026-10-08'.('both' === $type ? 'T00:00' : ''), $input->getAttribute('min'));
        $this->assertSame('2026-10-10'.('both' === $type ? 'T00:00' : ''), $input->getAttribute('max'));
    }

    public static function nativeDateBounds(): array
    {
        return [
            'date within bounds' => ['date', '2026-10-09', false],
            'date before minimum' => ['date', '2026-10-07', true],
            'date after maximum' => ['date', '2026-10-11', true],
            'datetime within bounds' => ['both', '2026-10-09T16:35', false],
            'datetime before minimum' => ['both', '2026-10-07T16:35', true],
            'datetime after maximum' => ['both', '2026-10-11T16:35', true],
        ];
    }

    #[DataProvider('nativeValues')]
    public function testEmptyAndInvalidNativeValuesDoNotProduceDates(string $type): void
    {
        $field = $this->createField($type);
        foreach (['', 'invalid'] as $value) {
            $field->setValue($value);
            $this->assertNull($field->getCarbon());
            $this->assertNull($field->getCarbonUtc());
            $this->assertSame('', $this->getInput($field)->getAttribute('value'));
        }
    }

    public static function nativeValues(): array
    {
        return [
            'date with custom display format' => ['date', '2026-10-09', 'date'],
            'time with 12-hour display format' => ['time', '16:35', 'time'],
            'datetime with custom display format' => ['both', '2026-10-09T16:35', 'datetime-local'],
        ];
    }

    private function createField(string $type, bool $native = true): DatetimeField
    {
        $field = $this->getMockBuilder(DatetimeField::class)
            ->setConstructorArgs([$this->createMock(Form::class)])
            ->onlyMethods(['getTranslationTable', 'getAttributes', 'getIdAttribute', 'renderRaw'])
            ->getMock()
        ;
        $field->method('getTranslationTable')->willReturn(new TranslationTable());
        $field->method('getAttributes')->willReturn(new FieldAttributesCollection());
        $field->method('getIdAttribute')->willReturn('form-input-date');
        $field->method('renderRaw')->willReturnCallback(static fn (string $html) => new Markup($html, 'UTF-8'));

        foreach ([
            'dateTimeType' => $type,
            'useNativeTypes' => $native,
            'useDatepicker' => false,
            'locale' => 'en',
            'dateOrder' => 'dmy',
            'dateSeparator' => '/',
        ] as $property => $value) {
            (new \ReflectionProperty(DatetimeField::class, $property))->setValue($field, $value);
        }

        return $field;
    }

    private function getValidation(): DateValidation
    {
        return (new \ReflectionClass(DateValidation::class))->newInstanceWithoutConstructor();
    }

    private function assertInput(DatetimeField $field, string $type, string $value): void
    {
        $input = $this->getInput($field);
        $this->assertSame($type, $input->getAttribute('type'));
        $this->assertSame($value, $input->getAttribute('value'));
    }

    private function getInput(DatetimeField $field): \DOMElement
    {
        $document = new \DOMDocument();
        $document->loadHTML((string) $field->renderInput());

        return $document->getElementsByTagName('input')->item(0);
    }
}
