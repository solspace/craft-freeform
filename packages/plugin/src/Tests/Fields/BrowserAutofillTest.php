<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Input;
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
    public function testContactPresetsUseValidOrderedTokens(): void
    {
        $setting = new \ReflectionProperty(PhoneField::class, 'browserAutofill');
        $options = $setting->getAttributes(Input\Select::class)[0]->newInstance()->options;

        self::assertSame('Cell / mobile phone', $options['mobile tel']);
        self::assertSame('Home phone', $options['home tel']);
        self::assertSame('Work phone', $options['work tel']);
        self::assertSame('Home email address', $options['home email']);
    }

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
        $html = new \ReflectionMethod($field, 'getInputHtml');

        self::assertStringNotContainsString('autocomplete=', $html->invoke($field));
        (new \ReflectionProperty($field, 'browserAutofill'))->setValue($field, $value);
        self::assertStringContainsString('autocomplete="'.$value.'"', $html->invoke($field));

        $serializer = new ManifestFieldSerializer(
            $this->createMock(ManifestLayoutSerializer::class),
            new ManifestExtensionResolver(),
            $this->createMock(FilesService::class),
        );
        $serialize = new \ReflectionMethod($serializer, 'serializeField');
        $manifest = $serialize->invoke($serializer, $form, $field);
        self::assertSame($value, $manifest['attributes']['input']['autocomplete']);

        $attributes->getInput()->replace('autocomplete', 'off');
        self::assertStringContainsString('autocomplete="off"', $html->invoke($field));
        $manifest = $serialize->invoke($serializer, $form, $field);
        self::assertSame('off', $manifest['attributes']['input']['autocomplete']);
    }

    public static function fields(): array
    {
        return [
            [TextField::class, 'given-name'],
            [TextareaField::class, 'street-address'],
            [EmailField::class, 'email'],
            [PhoneField::class, 'mobile tel'],
            [WebsiteField::class, 'url'],
            [PasswordField::class, 'new-password'],
        ];
    }

    public function testInternationalPhoneOnlyAddsAutocompleteWhenConfigured(): void
    {
        $form = $this->createMock(Form::class);
        $field = $this->getMockBuilder(PhoneField::class)
            ->setConstructorArgs([$form])
            ->onlyMethods(['getAttributes', 'getInternationalConfig', 'translate'])
            ->getMock()
        ;
        $field->method('getInternationalConfig')->willReturn([]);
        $field->method('translate')->willReturn('');
        $field->setValue('');
        $attributes = new FieldAttributesCollection();
        $field->method('getAttributes')->willReturn($attributes);
        (new \ReflectionProperty($field, 'international'))->setValue($field, true);
        $html = new \ReflectionMethod($field, 'getInputHtml');

        self::assertStringNotContainsString('autocomplete=', $html->invoke($field));
        (new \ReflectionProperty($field, 'browserAutofill'))->setValue($field, 'mobile tel');
        self::assertStringContainsString('autocomplete="mobile tel"', $html->invoke($field));
        $attributes->getInput()->replace('autocomplete', 'tel-national');
        self::assertStringContainsString('autocomplete="tel-national"', $html->invoke($field));
    }
}
