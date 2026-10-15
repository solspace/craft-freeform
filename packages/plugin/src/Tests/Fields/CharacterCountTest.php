<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Bundles\Fields\Validation\MaxLengthValidation;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\PasswordField;
use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;
use Solspace\Freeform\Fields\Implementations\Pro\RegexField;
use Solspace\Freeform\Fields\Implementations\Pro\WebsiteField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Helpers\CharacterCountHelper;
use Solspace\Freeform\Services\Headless\Manifest\ManifestFieldSerializer;

/**
 * @coversNothing
 */
class CharacterCountTest extends TestCase
{
    #[DataProvider('textClasses')]
    public function testOptInMarkupAndManifest(string $class): void
    {
        $form = $this->createMock(Form::class);
        $field = $this->getMockBuilder($class)->setConstructorArgs([$form])->onlyMethods(['getAttributes', 'translate'])->getMock();
        $field->method('translate')->willReturnCallback(static fn (?string $handle, mixed $defaultValue = null) => $defaultValue ?? '');
        $attributes = new FieldAttributesCollection();
        $attributes->getInput()->replace('id', 'custom-id')->replace('aria-describedby', 'help error')->replace('maxlength', 10);
        $field->method('getAttributes')->willReturn($attributes);
        $field->setValue('é');
        $html = new \ReflectionMethod($field, 'getInputHtml');
        self::assertStringNotContainsString('data-freeform-character-count', $html->invoke($field));
        (new \ReflectionProperty($field, 'showCharacterCount'))->setValue($field, true);
        $output = $html->invoke($field);
        self::assertStringContainsString('data-freeform-character-count', $output);
        self::assertStringContainsString('aria-describedby="help error"', $output);
        self::assertStringContainsString('maxlength="10"', $output);
        self::assertStringContainsString('{count} / {limit} characters', $output);
        $serializer = (new \ReflectionClass(ManifestFieldSerializer::class))->newInstanceWithoutConstructor();
        $config = (new \ReflectionMethod($serializer, 'serializeFrontendConfig'))->invoke($serializer, $form, $field);
        self::assertTrue($config['showCharacterCount']);
        self::assertSame('{count} characters', $config['characterCountMessages']['count']);
    }

    public static function textClasses(): array
    {
        return [[TextField::class], [TextareaField::class]];
    }

    #[DataProvider('otherClasses')]
    public function testInheritedFieldsDoNotExposeCounterSetting(string $class): void
    {
        $field = new $class($this->createMock(Form::class));
        $property = new \ReflectionProperty($field, 'showCharacterCount');
        self::assertSame([], $property->getAttributes(Input\Boolean::class));
        $property->setValue($field, true);
        self::assertFalse($field->isShowCharacterCount());
    }

    public static function otherClasses(): array
    {
        return [[HiddenField::class], [NumberField::class], [PasswordField::class], [PhoneField::class], [RegexField::class], [WebsiteField::class]];
    }

    #[DataProvider('lengths')]
    public function testMaximumLengthMatchesNativeControls(string $value, int $expected): void
    {
        self::assertSame($expected, CharacterCountHelper::count($value));
        $form = $this->createMock(Form::class);
        $field = new TextareaField($form);
        $field->setValue($value);
        $max = new \ReflectionProperty($field, 'maxLength');
        $max->setValue($field, $expected);
        $validator = (new \ReflectionClass(MaxLengthValidation::class))->newInstanceWithoutConstructor();
        $validator->validate(new ValidateEvent($form, $field));
        self::assertSame([], $field->getErrors());
        $field->setValue($value.'x');
        $validator->validate(new ValidateEvent($form, $field));
        self::assertCount(1, $field->getErrors());
    }

    public static function lengths(): array
    {
        return [['é', 1], ['😀', 2], ["a\r\nb", 3], ["a\rb", 3], ["e\u{0301}", 2], ['0', 1]];
    }
}
