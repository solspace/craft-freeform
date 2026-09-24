<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\Validation\PhoneValidation;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Services\Headless\Manifest\ManifestFieldSerializer;

/**
 * @coversNothing
 */
class InternationalPhoneTest extends TestCase
{
    #[DataProvider('numbers')]
    public function testValidationAndNormalization(string $value, bool $valid, ?string $expected): void
    {
        $field = $this->field();
        $field->setValue($value);
        $validator = (new \ReflectionClass(PhoneValidation::class))->newInstanceWithoutConstructor();
        $validator->validate(new ValidateEvent($field->getForm(), $field));
        self::assertSame($valid, [] === $field->getErrors());
        self::assertSame($expected ?? $value, $field->getValue());
    }

    public static function numbers(): array
    {
        return [
            ['020 7946 0018', true, '+442079460018'],
            ['+1 (201) 555-0123', true, '+12015550123'],
            ['+1 416 555 0123', true, '+14165550123'],
            ['', true, ''], ['0', false, null], ['123', false, null],
            ['+49 30 123456', false, null], ['020 7946 0018 ext 123', false, null],
            ['call +44 20 7946 0018', false, null], [str_repeat('1', 200), false, null],
        ];
    }

    public function testRestrictionsAndLegacyMode(): void
    {
        $field = $this->field(true, ' zz ');
        self::assertSame([], $field->getAllowedCountryCodes());
        self::assertNull($field->getInitialCountryCode());
        $field = $this->field(true, 'ca, CA,US, zz');
        self::assertSame(['CA', 'US'], $field->getAllowedCountryCodes());
        self::assertSame('CA', $field->getInitialCountryCode());
        self::assertSame('ca, CA,US, zz', $field->getAllowedCountries());
        self::assertSame('GB', $field->getDefaultCountry());
        self::assertInstanceOf(ExtraFieldInterface::class, $field);
        $form = $this->createMock(Form::class);
        $legacy = $this->getMockBuilder(PhoneField::class)->setConstructorArgs([$form])->onlyMethods(['getPattern'])->getMock();
        $legacy->method('getPattern')->willReturn('(000) 000-0000');
        $legacy->setValue('(201) 555-0123');
        self::assertFalse($legacy->isInternational());
        $validator = (new \ReflectionClass(PhoneValidation::class))->newInstanceWithoutConstructor();
        $validator->validate(new ValidateEvent($form, $legacy));
        self::assertSame([], $legacy->getErrors());
        self::assertSame('(201) 555-0123', $legacy->getValue());
    }

    public function testCountryRestrictionsCannotBeBypassedWithAnInternationalNumber(): void
    {
        $validator = (new \ReflectionClass(PhoneValidation::class))->newInstanceWithoutConstructor();
        foreach (['US', 'ZZ'] as $allowed) {
            $field = $this->field(true, $allowed);
            $field->setValue('+14165550123');
            $validator->validate(new ValidateEvent($field->getForm(), $field));
            self::assertCount(1, $field->getErrors());
        }
    }

    public function testOptInMarkupAndManifest(): void
    {
        $form = $this->createMock(Form::class);
        $field = $this->getMockBuilder(PhoneField::class)->setConstructorArgs([$form])->onlyMethods(['getAttributes', 'translate'])->getMock();
        $field->method('getAttributes')->willReturn(new FieldAttributesCollection());
        $field->method('translate')->willReturn('Custom example');
        self::assertStringNotContainsString('data-freeform-phone', $field->getInputHtml());
        (new \ReflectionProperty($field, 'international'))->setValue($field, true);
        (new \ReflectionProperty($field, 'useJsMask'))->setValue($field, true);
        self::assertFalse($field->isUseJsMask());
        self::assertStringContainsString('data-freeform-phone', $field->getInputHtml());
        $serializer = (new \ReflectionClass(ManifestFieldSerializer::class))->newInstanceWithoutConstructor();
        $config = (new \ReflectionMethod($serializer, 'serializeFrontendConfig'))->invoke($serializer, $form, $field);
        self::assertTrue($config['international']);
        self::assertSame('US', $config['defaultCountry']);
        self::assertNotEmpty($config['examples']['GB']);
    }

    private function field(bool $enabled = true, string $allowed = 'GB, US, CA'): PhoneField
    {
        $field = new PhoneField($this->createMock(Form::class));
        foreach (['international' => $enabled, 'defaultCountry' => 'GB', 'allowedCountries' => $allowed] as $key => $value) {
            (new \ReflectionProperty($field, $key))->setValue($field, $value);
        }

        return $field;
    }
}
