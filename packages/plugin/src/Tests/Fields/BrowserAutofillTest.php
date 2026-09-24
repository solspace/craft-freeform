<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\Pro\PasswordField;
use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;
use Solspace\Freeform\Fields\Implementations\Pro\WebsiteField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Services\FilesService;
use Solspace\Freeform\Services\Headless\Manifest\ManifestExtensionResolver;
use Solspace\Freeform\Services\Headless\Manifest\ManifestFieldSerializer;
use Solspace\Freeform\Services\Headless\Manifest\ManifestLayoutSerializer;

/**
 * @coversNothing
 */
class BrowserAutofillTest extends TestCase
{
    #[DataProvider('fields')]
    public function testSettingAndCustomAttributePrecedence(string $class, string $value): void
    {
        $form = $this->createMock(Form::class);
        $field = $this->getMockBuilder($class)->setConstructorArgs([$form])->onlyMethods(['getAttributes', 'getDefaultValue', 'translate'])->getMock();
        $field->method('translate')->willReturnCallback(static fn (?string $handle, mixed $defaultValue = null) => $defaultValue ?? '');
        $field->method('getDefaultValue')->willReturn('');
        $field->setValue('');
        $attributes = new FieldAttributesCollection();
        $field->method('getAttributes')->willReturn($attributes);

        self::assertStringNotContainsString('autocomplete=', $field->getInputHtml());
        (new \ReflectionProperty($field, 'browserAutofill'))->setValue($field, $value);
        self::assertStringContainsString('autocomplete="'.$value.'"', $field->getInputHtml());

        $serializer = new ManifestFieldSerializer(
            $this->createMock(ManifestLayoutSerializer::class),
            new ManifestExtensionResolver(),
            $this->createMock(FilesService::class),
        );
        $serialize = new \ReflectionMethod($serializer, 'serializeField');
        $manifest = $serialize->invoke($serializer, $form, $field);
        self::assertSame($value, $manifest['attributes']['input']['autocomplete']);

        $attributes->getInput()->replace('autocomplete', 'off');
        self::assertStringContainsString('autocomplete="off"', $field->getInputHtml());
        $manifest = $serialize->invoke($serializer, $form, $field);
        self::assertSame('off', $manifest['attributes']['input']['autocomplete']);
    }

    public static function fields(): array
    {
        return [
            [TextField::class, 'given-name'],
            [TextareaField::class, 'street-address'],
            [EmailField::class, 'email'],
            [PhoneField::class, 'tel'],
            [WebsiteField::class, 'url'],
            [PasswordField::class, 'new-password'],
        ];
    }

    public function testInternationalPhoneKeepsItsDefaultAndAllowsAnOverride(): void
    {
        $form = $this->createMock(Form::class);
        $field = $this->getMockBuilder(PhoneField::class)
            ->setConstructorArgs([$form])
            ->onlyMethods(['getAttributes', 'getInternationalConfig', 'translate'])
            ->getMock();
        $field->method('getInternationalConfig')->willReturn([]);
        $field->method('translate')->willReturn('');
        $field->setValue('');
        $attributes = new FieldAttributesCollection();
        $field->method('getAttributes')->willReturn($attributes);
        (new \ReflectionProperty($field, 'international'))->setValue($field, true);

        self::assertStringContainsString('autocomplete="tel"', $field->getInputHtml());
        (new \ReflectionProperty($field, 'browserAutofill'))->setValue($field, 'off');
        self::assertStringContainsString('autocomplete="off"', $field->getInputHtml());
        $attributes->getInput()->replace('autocomplete', 'tel-national');
        self::assertStringContainsString('autocomplete="tel-national"', $field->getInputHtml());
    }
}
