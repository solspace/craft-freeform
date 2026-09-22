<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\Pro\PasswordField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Services\Headless\Manifest\ManifestFieldSerializer;

/**
 * @coversNothing
 */
class PasswordToggleTest extends TestCase
{
    public function testOptInMarkupAndManifest(): void
    {
        $form = $this->createMock(Form::class);
        $field = $this->getMockBuilder(PasswordField::class)->setConstructorArgs([$form])->onlyMethods(['getAttributes', 'translate'])->getMock();
        $field->method('translate')->willReturn('');
        $attributes = new FieldAttributesCollection();
        $attributes->getInput()->replace('id', 'pw')->replace('aria-describedby', 'help')->replace('autocomplete', 'new-password');
        $field->method('getAttributes')->willReturn($attributes);
        $field->setValue('secret');
        self::assertInstanceOf(ExtraFieldInterface::class, $field);
        self::assertInstanceOf(NoStorageInterface::class, $field);
        self::assertFalse($field->isShowPasswordToggle());
        self::assertStringNotContainsString('data-freeform-password-toggle', $field->getInputHtml());
        $setting = new \ReflectionProperty($field, 'showPasswordToggle');
        $setting->setValue($field, true);
        $html = $field->getInputHtml();
        self::assertStringContainsString('type="password"', $html);
        self::assertStringContainsString('data-freeform-password-toggle', $html);
        self::assertStringContainsString('aria-describedby="help"', $html);
        self::assertStringContainsString('autocomplete="new-password"', $html);
        self::assertSame('secret', $field->getValue());
        $serializer = (new \ReflectionClass(ManifestFieldSerializer::class))->newInstanceWithoutConstructor();
        $method = new \ReflectionMethod($serializer, 'serializeFrontendConfig');
        $config = $method->invoke($serializer, $form, $field);
        self::assertTrue($config['showPasswordToggle']);
        self::assertSame(['show' => 'Show password', 'hide' => 'Hide password'], $config['passwordToggleLabels']);
        $setting->setValue($field, false);
        self::assertStringNotContainsString('data-freeform-password-toggle', $field->getInputHtml());
        self::assertSame([], $method->invoke($serializer, $form, $field));
    }
}
