<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\Validation\NumericFieldValidation;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Services\Headless\Manifest\ManifestFieldSerializer;

/** @coversNothing */
class NumberFieldTest extends TestCase
{
    #[DataProvider('numbers')]
    public function testSubmittedDigitsAreValidatedWithoutRounding(mixed $value, array $config, ?string $error): void
    {
        $field = $this->field($config);
        $field->setValue($value);
        $validator = (new \ReflectionClass(NumericFieldValidation::class))->newInstanceWithoutConstructor();
        $validator->validate(new ValidateEvent($field->getForm(), $field));
        self::assertSame(null === $error ? [] : [$error], $field->getErrors());
        self::assertSame($value, $field->getRawValue());
        if (null !== $error) {
            self::assertSame($value, $field->getValue());
        }
    }

    public static function numbers(): array
    {
        return [
            ['', [], null], [null, [], null], ['0', [], null], ['12', [], null],
            ['12.5', [], 'Enter a whole number.'],
            ['12.345', ['decimalCount' => 2], 'Use no more than 2 decimal places.'],
            ['12.3400', ['decimalCount' => 2], 'Use no more than 2 decimal places.'],
            ['12.34', ['decimalCount' => 2], null], ['12,34', ['decimalCount' => 2], null],
            ['.25', ['decimalCount' => 2], null],
            ['-1', [], 'Enter zero or a positive number.'],
            ['-1.25', ['decimalCount' => 2, 'allowNegative' => true], null],
            ['0', ['minMaxValues' => [1, 100]], 'Enter a number between 1 and 100.'],
            ['101', ['minMaxValues' => [1, 100]], 'Enter a number between 1 and 100.'],
            ['0', ['minMaxValues' => [0, 100]], null],
            ['2', ['minMaxValues' => [null, 0]], 'Enter a number less than or equal to 0.'],
            ['0.25', ['decimalCount' => 2, 'minMaxValues' => [0.5, null]], 'Enter a number greater than or equal to 0.5.'],
            ['1e3', [], null], ['1.25e2', [], null],
            ['1e-3', ['decimalCount' => 2], 'Use no more than 2 decimal places.'],
            ['1e999', [], 'Enter a number.'], ['1e', [], 'Enter a number.'],
            ['-', [], 'Enter a number.'], ['.', [], 'Enter a number.'],
            ['1,234.5', ['decimalCount' => 2], 'Enter a number.'],
            ['nope', [], 'Enter a number.'], [[], [], 'Enter a number.'],
            [['12'], [], 'Enter a number.'], [false, [], 'Enter a number.'],
        ];
    }

    public function testKeyboardStepAndHeadlessConfigurationUseExistingSettings(): void
    {
        $field = $this->field();
        self::assertSame('numeric', $field->getInputMode());
        self::assertSame(1.0, $field->getStep());
        $field = $this->field(['decimalCount' => 2, 'minMaxValues' => [0.5, 100.5]]);
        self::assertSame('decimal', $field->getInputMode());
        self::assertSame(0.01, $field->getStep());
        self::assertSame(0.5, $field->getMinValue());
        self::assertSame(100.5, $field->getMaxValue());
        $serializer = (new \ReflectionClass(ManifestFieldSerializer::class))->newInstanceWithoutConstructor();
        self::assertSame($field->getNumberConfig(), (new \ReflectionMethod($serializer, 'serializeFrontendConfig'))->invoke($serializer, $field->getForm(), $field));
        $field = $this->field(['decimalCount' => 2, 'step' => 0.25, 'allowNegative' => true]);
        self::assertSame('text', $field->getInputMode());
        self::assertSame(0.25, $field->getStep());
    }

    public function testMarkupPreservesInputAndCustomAttributesWithoutAddingSettings(): void
    {
        $field = $this->getMockBuilder(NumberField::class)
            ->setConstructorArgs([$this->createMock(Form::class)])
            ->onlyMethods(['getAttributes', 'getIdAttribute', 'translate'])
            ->getMock()
        ;
        $attributes = new FieldAttributesCollection();
        $field->method('getAttributes')->willReturn($attributes);
        $field->method('getIdAttribute')->willReturn('amount');
        $field->method('translate')->willReturn('');
        (new \ReflectionProperty($field, 'decimalCount'))->setValue($field, 2);
        $field->setValue('12.345');
        $html = (new \ReflectionMethod($field, 'getInputHtml'))->invoke($field);
        self::assertStringContainsString('inputmode="decimal"', $html);
        self::assertStringContainsString('step="0.01"', $html);
        self::assertStringContainsString('min="0"', $html);
        self::assertStringContainsString('value="12.345"', $html);
        self::assertStringContainsString('data-freeform-number=', $html);
        $attributes->getError()->replace('tag', 'div')->replace('class', 'custom-error text-danger')->replace('style', 'font-style:italic');
        $html = (new \ReflectionMethod($field, 'getInputHtml'))->invoke($field);
        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $config = json_decode($document->getElementsByTagName('input')->item(0)->getAttribute('data-freeform-number'), true, flags: \JSON_THROW_ON_ERROR);
        self::assertSame('div', $config['error']['tag']);
        self::assertSame('div', $config['error']['itemTag']);
        self::assertSame('custom-error text-danger', $config['error']['attributes']['class']);
        self::assertSame('font-style:italic', $config['error']['attributes']['style']);
        self::assertFalse($field->hasErrors());
        $attributes->getInput()->replace('inputmode', 'text')->replace('step', 0.25);
        $html = (new \ReflectionMethod($field, 'getInputHtml'))->invoke($field);
        self::assertStringContainsString('inputmode="text"', $html);
        self::assertStringContainsString('step="0.25"', $html);
    }

    private function field(array $properties = []): NumberField
    {
        $field = new NumberField($this->createMock(Form::class));
        foreach ($properties as $name => $value) {
            (new \ReflectionProperty($field, $name))->setValue($field, $value);
        }

        return $field;
    }
}
