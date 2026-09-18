<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\Validation\RangeFieldValidation;
use Solspace\Freeform\Bundles\Fields\Validation\RequiredFieldValidation;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\Implementations\RangeField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Services\Headless\Manifest\ManifestFieldSerializer;

#[CoversClass(RangeField::class)]
#[CoversClass(RangeFieldValidation::class)]
#[CoversClass(ManifestFieldSerializer::class)]
class RangeFieldTest extends TestCase
{
    #[DataProvider('defaults')]
    public function testDefaultMatchesBoundsAndStep(array $config, float $expected): void
    {
        $field = new RangeField($this->createMock(Form::class));
        $this->configure($field, $config);
        self::assertSame($expected, $field->getDefaultValue());
        $field->setValue($expected);
        $this->validate($field);
        self::assertSame([], $field->getErrors());
    }

    public static function defaults(): array
    {
        return [
            [[], 0.0],
            [['minValue' => -10], -10.0],
            [['minValue' => -1, 'maxValue' => 1, 'step' => 0.1, 'defaultValue' => 0.3], 0.3],
            [['step' => 3, 'defaultValue' => 100], 99.0],
            [['step' => 10, 'defaultValue' => 25], 30.0],
            [['defaultValue' => -200], 0.0],
            [['defaultValue' => 200], 100.0],
            [['step' => 0, 'defaultValue' => 25], 25.0],
            [['minValue' => 20, 'maxValue' => 10], 20.0],
            [['minValue' => 0.1, 'maxValue' => 0.3, 'step' => 0.1, 'defaultValue' => 0.3], 0.3],
        ];
    }

    #[DataProvider('values')]
    public function testSubmittedValuesAreValidatedWithoutClamping(mixed $value, array $config, bool $valid): void
    {
        $field = new RangeField($this->createMock(Form::class));
        $this->configure($field, $config);
        $field->setValue($value);
        $this->validate($field);
        self::assertSame($valid, [] === $field->getErrors());
        if (\is_numeric($value) && is_finite((float) $value)) {
            self::assertEquals($value, $field->getValue());
        }
    }

    public static function values(): array
    {
        return [
            ['0', [], true], ['100', [], true], ['50', [], true],
            ['-1', [], false], ['101', [], false], ['1.5', [], false],
            ['0.3', ['step' => 0.1], true],
            ['-2.5', ['minValue' => -5, 'step' => 0.5], true],
            ['0.25', ['step' => 0.1], false],
            ['0.15', ['minValue' => 0.05, 'step' => 0.1], true],
            ['abc', [], false], [['20'], [], false], [true, [], false],
            [\INF, [], false], [\NAN, [], false], ['1e999', [], false],
            ['', [], true], [null, [], true],
        ];
    }

    public function testNativeMarkupAndOutputUseConfiguredBoundsAndPreserveZero(): void
    {
        $field = $this->getMockBuilder(RangeField::class)->setConstructorArgs([$this->createMock(Form::class)])
            ->onlyMethods(['getAttributes', 'getIdAttribute', 'getHandle', 'getRequiredAttribute'])->getMock()
        ;
        $field->method('getAttributes')->willReturn(new FieldAttributesCollection());
        $field->method('getIdAttribute')->willReturn('budget');
        $field->method('getHandle')->willReturn('budget');
        $field->method('getRequiredAttribute')->willReturn('required');
        $this->configure($field, ['minValue' => -10, 'maxValue' => 10, 'step' => 0.5]);
        $field->setValue('0');
        $html = (new \ReflectionMethod($field, 'getInputHtml'))->invoke($field);
        $doc = new \DOMDocument();
        $previous = libxml_use_internal_errors(true);
        $doc->loadHTML($html);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);
        $input = $doc->getElementsByTagName('input')->item(0);
        self::assertSame('range', $input->getAttribute('type'));
        self::assertSame('budget', $input->getAttribute('name'));
        self::assertSame('0', $input->getAttribute('value'));
        self::assertSame('-10', $input->getAttribute('min'));
        self::assertSame('10', $input->getAttribute('max'));
        self::assertSame('0.5', $input->getAttribute('step'));
        self::assertSame('budget', $doc->getElementsByTagName('output')->item(0)->getAttribute('for'));
    }

    public function testManifestContainsTheSameConfigurationAndDefault(): void
    {
        $form = $this->createMock(Form::class);
        $field = new RangeField($form);
        $this->configure($field, ['minValue' => -1, 'maxValue' => 1, 'step' => 0.25, 'defaultValue' => 0.3]);
        $serializer = (new \ReflectionClass(ManifestFieldSerializer::class))->newInstanceWithoutConstructor();
        self::assertSame(['min' => -1.0, 'max' => 1.0, 'step' => 0.25], (new \ReflectionMethod($serializer, 'serializeFrontendConfig'))->invoke($serializer, $form, $field));
        self::assertSame(0.25, (new \ReflectionMethod($serializer, 'resolveDefaultValue'))->invoke($serializer, $field));
    }

    public function testZeroSatisfiesRequiredButMissingValueDoesNot(): void
    {
        $field = $this->getMockBuilder(RangeField::class)->setConstructorArgs([$this->createMock(Form::class)])
            ->onlyMethods(['getRequiredErrorMessage'])->getMock()
        ;
        $field->method('getRequiredErrorMessage')->willReturn('Please select a value.');
        $this->configure($field, ['required' => true]);
        $validator = (new \ReflectionClass(RequiredFieldValidation::class))->newInstanceWithoutConstructor();
        $field->setValue('0');
        $validator->validate(new ValidateEvent($field->getForm(), $field));
        self::assertSame([], $field->getErrors());
        $field->setValue('');
        $validator->validate(new ValidateEvent($field->getForm(), $field));
        self::assertSame(['Please select a value.'], $field->getErrors());
    }

    private function configure(RangeField $field, array $config): void
    {
        foreach ($config as $key => $value) {
            (new \ReflectionProperty($field, $key))->setValue($field, $value);
        }
    }

    private function validate(RangeField $field): void
    {
        $validator = (new \ReflectionClass(RangeFieldValidation::class))->newInstanceWithoutConstructor();
        $validator->validate(new ValidateEvent($field->getForm(), $field));
    }
}
