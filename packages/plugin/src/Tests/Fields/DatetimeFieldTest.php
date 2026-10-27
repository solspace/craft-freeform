<?php

namespace Solspace\Freeform\Tests\Fields;

use Carbon\Carbon;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Bundles\Fields\Validation\DateValidation;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories\Date;
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
        $this->assertSame('2026-10-10'.('both' === $type ? 'T23:59' : ''), $input->getAttribute('max'));
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

    #[DataProvider('todayDateBounds')]
    public function testNativeTodayBounds(string $type, string $format): void
    {
        $field = $this->createField($type);
        (new \ReflectionProperty(DatetimeField::class, 'minDate'))->setValue($field, 'today');
        (new \ReflectionProperty(DatetimeField::class, 'maxDate'))->setValue($field, 'today');
        $today = new \DateTime('today');

        $input = $this->getInput($field);
        $this->assertSame($today->format($format), $input->getAttribute('min'));
        $this->assertSame((clone $today)->setTime(23, 59)->format($format), $input->getAttribute('max'));

        $field->setValue($today->format($format));
        $event = new ValidateEvent($field->getForm(), $field);
        $this->getValidation()->validateMinDate($event);
        $this->getValidation()->validateMaxDate($event);
        $this->assertSame([], $field->getErrors());

        $field->setValue((clone $today)->modify('-1 day')->format($format));
        $this->getValidation()->validateMinDate($event);
        $this->assertCount(1, $field->getErrors());

        $field->setValue((clone $today)->modify('+1 day')->format($format));
        $this->getValidation()->validateMaxDate($event);
        $this->assertCount(2, $field->getErrors());
    }

    public static function todayDateBounds(): array
    {
        return [
            'date' => ['date', 'Y-m-d'],
            'datetime' => ['both', 'Y-m-d\TH:i'],
        ];
    }

    public function testBuiltInDatepickerKeepsRelativeTodayBounds(): void
    {
        $field = $this->createField('date', false);
        (new \ReflectionProperty(DatetimeField::class, 'picker'))->setValue($field, 'flatpickr');
        (new \ReflectionProperty(DatetimeField::class, 'minDate'))->setValue($field, 'today');
        (new \ReflectionProperty(DatetimeField::class, 'maxDate'))->setValue($field, 'today');

        $input = $this->getInput($field);
        $this->assertSame('today', $input->getAttribute('data-datepicker-min-date'));
        $this->assertSame('today', $input->getAttribute('data-datepicker-max-date'));
        $this->assertFalse($input->hasAttribute('min'));
        $this->assertFalse($input->hasAttribute('max'));
    }

    #[DataProvider('translatedDateInstructions')]
    public function testTranslatedDateExamplesRemainParseable(string $property, string $locale): void
    {
        $reflection = new \ReflectionProperty(DatetimeField::class, $property);
        $instructions = $reflection->getAttributes(Input\DateExpression::class)[0]->newInstance()->instructions;
        $translations = require __DIR__.'/../../translations/'.$locale.'/freeform.php';

        $this->assertArrayHasKey($instructions, $translations);
        preg_match_all("/'([^']+)'/", $instructions, $sourceExamples);
        // Compare quoted literals only: surrounding prose should be localized.
        foreach ($sourceExamples[1] as $example) {
            $this->assertStringContainsString("'".$example."'", $translations[$instructions]);
            $this->assertInstanceOf(\DateTime::class, new \DateTime($example));
        }
    }

    public static function translatedDateInstructions(): array
    {
        $cases = [];
        foreach (['initialValue', 'minDate', 'maxDate'] as $property) {
            foreach (['en', 'nl', 'de', 'fr', 'it'] as $locale) {
                $cases[$property.' '.$locale] = [$property, $locale];
            }
        }

        return $cases;
    }

    public function testNativeTimeInputDoesNotReceiveDateBounds(): void
    {
        $field = $this->createField('time');
        (new \ReflectionProperty(DatetimeField::class, 'minDate'))->setValue($field, 'today');
        (new \ReflectionProperty(DatetimeField::class, 'maxDate'))->setValue($field, 'today');

        $input = $this->getInput($field);
        $this->assertFalse($input->hasAttribute('min'));
        $this->assertFalse($input->hasAttribute('max'));
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

    public function testPickerModeMappingPreservesAllLegacyCombinations(): void
    {
        foreach ([
            [true, true, 'browser'], [true, false, 'browser'],
            [false, true, 'flatpickr'], [false, false, 'none'],
        ] as [$native, $enabled, $expected]) {
            $this->assertSame($expected, DatetimeField::normalizePickerProperties(['useNativeTypes' => $native, 'useDatepicker' => $enabled])['picker']);
        }
        $this->assertSame('flatpickr', DatetimeField::normalizePickerProperties([])['picker']);
        $this->assertSame('freeform', DatetimeField::normalizePickerProperties(['picker' => 'freeform', 'useNativeTypes' => true])['picker']);
    }

    public function testFreeformPickerRendersExistingFormatBoundsAndInitialValue(): void
    {
        $field = $this->createField('both', false);
        foreach (['picker' => 'freeform', 'initialValue' => '2026-10-26 16:35:00', 'minDate' => '2026-10-01', 'maxDate' => '2026-10-31', 'minuteStep' => 15] as $key => $value) {
            (new \ReflectionProperty(DatetimeField::class, $key))->setValue($field, $value);
        }
        $input = $this->getInput($field);
        $this->assertSame('text', $input->getAttribute('type'));
        $this->assertSame('freeform', $input->getAttribute('data-datepicker-kind'));
        $this->assertSame('26/10/2026 4:35 PM', $input->getAttribute('value'));
        $this->assertSame('d/m/Y g:i A', $input->getAttribute('data-datepicker-php-format'));
        $this->assertSame('2026-10-01', $input->getAttribute('data-datepicker-min-value'));
        $this->assertSame('2026-10-31', $input->getAttribute('data-datepicker-max-value'));
        $this->assertSame('15', $input->getAttribute('data-datepicker-minute-step'));
    }

    public function testDefaultsPreserveLegacyOverridesAndLocks(): void
    {
        $class = Date::class;
        $this->assertSame('freeform', (new $class())->picker->getValue());
        $classic = new $class(['datepicker' => ['value' => true, 'locked' => true], 'nativeTypes' => ['value' => false]]);
        $this->assertSame('flatpickr', $classic->picker->getValue());
        $this->assertTrue($classic->picker->isLocked());
        $browser = new $class(['nativeTypes' => ['value' => true]]);
        $this->assertSame('browser', $browser->picker->getValue());
        $none = new $class(['datepicker' => ['value' => false], 'nativeTypes' => ['value' => false]]);
        $this->assertSame('none', $none->picker->getValue());
        $explicit = new $class(['picker' => ['value' => 'freeform'], 'nativeTypes' => ['value' => true]]);
        $this->assertSame('freeform', $explicit->picker->getValue());
    }

    public function testFreeformPickerRetainsServerValidationForRelativeDateBounds(): void
    {
        foreach (['-4 days' => true, '-2 days' => false, '+1 day' => true] as $offset => $expectedError) {
            $field = $this->createField('date', false);
            (new \ReflectionProperty(DatetimeField::class, 'picker'))->setValue($field, 'freeform');
            (new \ReflectionProperty(DatetimeField::class, 'minDate'))->setValue($field, '3 days ago');
            (new \ReflectionProperty(DatetimeField::class, 'maxDate'))->setValue($field, 'today');
            $field->setValue((new \DateTime($offset))->format($field->getFormat()));
            $event = new ValidateEvent($field->getForm(), $field);
            $validation = $this->getValidation();
            $validation->validateFormat($event);
            $validation->validateMinDate($event);
            $validation->validateMaxDate($event);
            $this->assertSame($expectedError, !empty($field->getErrors()), $offset);
            $this->assertSame(date('Y-m-d', strtotime('3 days ago')), $this->getInput($field)->getAttribute('data-datepicker-min-value'));
        }
    }

    #[DataProvider('preciseBounds')]
    public function testTimeAwareLimitsAreEnforcedOnTheServerForEveryPicker(string $picker, string $property, string $expression, string $value, bool $invalid): void
    {
        $previousNow = Carbon::getTestNow();
        Carbon::setTestNow(new Carbon('2026-10-26 19:00:00'));

        try {
            $field = $this->createField('both', 'browser' === $picker);
            (new \ReflectionProperty(DatetimeField::class, 'picker'))->setValue($field, $picker);
            (new \ReflectionProperty(DatetimeField::class, $property))->setValue($field, $expression);
            $date = new \DateTime($value);
            $field->setValue($date->format($field->isUseNativeTypes() ? $field->getNativeFormat() : $field->getFormat()));
            $event = new ValidateEvent($field->getForm(), $field);
            $validation = $this->getValidation();
            $validation->validateFormat($event);
            $validation->validateMinDate($event);
            $validation->validateMaxDate($event);
            $this->assertSame($invalid, !empty($field->getErrors()));
        } finally {
            Carbon::setTestNow($previousNow);
        }
    }

    public static function preciseBounds(): array
    {
        $cases = [
            '2am is too early at 7pm' => ['minDate', '12 hours ago', '2026-10-26 02:00', true],
            'before cutoff' => ['minDate', '12 hours ago', '2026-10-26 06:59', true],
            'exact cutoff' => ['minDate', '12 hours ago', '2026-10-26 07:00', false],
            'after cutoff' => ['minDate', '12 hours ago', '2026-10-26 07:01', false],
            'relative minutes' => ['minDate', '30 minutes ago', '2026-10-26 18:29', true],
            'now' => ['minDate', 'now', '2026-10-26 18:59', true],
            'max before cutoff' => ['maxDate', '12 hours ago', '2026-10-26 06:59', false],
            'max exact cutoff' => ['maxDate', '12 hours ago', '2026-10-26 07:00', false],
            'max after cutoff' => ['maxDate', '12 hours ago', '2026-10-26 07:01', true],
            'seconds min excludes earlier minute' => ['minDate', '2026-10-26 07:00:30', '2026-10-26 07:00', true],
            'seconds min includes next minute' => ['minDate', '2026-10-26 07:00:30', '2026-10-26 07:01', false],
            'seconds max includes earlier minute' => ['maxDate', '2026-10-26 07:00:30', '2026-10-26 07:00', false],
            'seconds max excludes next minute' => ['maxDate', '2026-10-26 07:00:30', '2026-10-26 07:01', true],
            'explicit midnight' => ['maxDate', '2026-10-26 00:00', '2026-10-26 00:01', true],
            'date-only min includes midnight' => ['minDate', '2026-10-26', '2026-10-26 00:00', false],
            'date-only max includes evening' => ['maxDate', '2026-10-26', '2026-10-26 23:59', false],
            'date-only max excludes next day' => ['maxDate', '2026-10-26', '2026-10-27 00:00', true],
            'today includes evening' => ['maxDate', 'today', '2026-10-26 23:59', false],
            'tomorrow includes evening' => ['maxDate', 'tomorrow', '2026-10-27 23:59', false],
            'relative day includes evening' => ['maxDate', '3 days ago', '2026-10-23 23:59', false],
            'day plus explicit time' => ['minDate', 'today 7am', '2026-10-26 02:00', true],
        ];
        $data = [];
        foreach (['freeform', 'flatpickr', 'browser', 'none'] as $picker) {
            foreach ($cases as $name => $case) {
                $data[$picker.' '.$name] = [$picker, ...$case];
            }
        }

        return $data;
    }

    public function testPickerReceivesPreciseBoundsAndRelativeOffsetsInTheServerClock(): void
    {
        $previousNow = Carbon::getTestNow();
        Carbon::setTestNow(new Carbon('2026-10-26 19:00:00'));

        try {
            $field = $this->createField('both', false);
            foreach (['picker' => 'freeform', 'minDate' => '12 hours ago', 'maxDate' => '+2 hours'] as $key => $value) {
                (new \ReflectionProperty(DatetimeField::class, $key))->setValue($field, $value);
            }
            $input = $this->getInput($field);
            $this->assertSame('2026-10-26T07:00:00', $input->getAttribute('data-datepicker-min-value'));
            $this->assertSame('2026-10-26T21:00:00', $input->getAttribute('data-datepicker-max-value'));
            $this->assertSame('-43200', $input->getAttribute('data-datepicker-min-offset'));
            $this->assertSame('7200', $input->getAttribute('data-datepicker-max-offset'));
            $this->assertSame('2026-10-26T19:00:00', $input->getAttribute('data-datepicker-reference-date'));
            $this->assertSame('d/m/Y g:i A', $field->getDateBoundaryFormat('12 hours ago'));
            foreach (['today', 'tomorrow', 'next monday', '3 days ago', '2026-10-26'] as $expression) {
                $this->assertSame('d/m/Y', $field->getDateBoundaryFormat($expression), $expression);
            }
            (new \ReflectionProperty(DatetimeField::class, 'dateTimeType'))->setValue($field, 'date');
            $this->assertSame('2026-10-26', $field->getPickerMinDate());
            $this->assertNull($field->getMinDateOffset());
            $this->assertSame('2026-10-26 00:00:00', $field->getMinDateBoundary()->format('Y-m-d H:i:s'));
            $this->assertSame('2026-10-26 23:59:59', $field->getMaxDateBoundary()->format('Y-m-d H:i:s'));
        } finally {
            Carbon::setTestNow($previousNow);
        }
    }

    public function testMinutePrecisionInputsRoundMinUpAndMaxDownWithoutInheritingCurrentSeconds(): void
    {
        $previousNow = Carbon::getTestNow();
        Carbon::setTestNow(new Carbon('2026-10-26 19:00:45'));

        try {
            $field = $this->createField('both');
            foreach (['minDate', 'maxDate'] as $key) {
                (new \ReflectionProperty(DatetimeField::class, $key))->setValue($field, '2026-10-26 07:00:30');
            }
            $this->assertSame('2026-10-26T07:01', $field->getMinDateInputValue($field->getNativeFormat()));
            $this->assertSame('2026-10-26T07:00', $field->getMaxDateInputValue($field->getNativeFormat()));
            $field->setValue('2026-10-26T07:00');
            $this->getValidation()->validateMaxDate(new ValidateEvent($field->getForm(), $field));
            $this->assertEmpty($field->getErrors());
        } finally {
            Carbon::setTestNow($previousNow);
        }
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
            'picker' => $native ? 'browser' : 'none',
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
