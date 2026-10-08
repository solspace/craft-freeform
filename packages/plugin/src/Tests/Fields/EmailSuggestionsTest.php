<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Services\Headless\Manifest\ManifestFieldSerializer;

/**
 * @coversNothing
 */
class EmailSuggestionsTest extends TestCase
{
    public function testOptInMarkupAndManifestDoNotChangeTheAddress(): void
    {
        $form = $this->createMock(Form::class);
        $field = $this->getMockBuilder(EmailField::class)->setConstructorArgs([$form])->onlyMethods(['getAttributes', 'translate'])->getMock();
        $field->method('translate')->willReturn('');
        $attributes = new FieldAttributesCollection();
        $attributes->getInput()->replace('id', 'email')->replace('aria-describedby', 'help errors')->replace('maxlength', 200);
        $field->method('getAttributes')->willReturn($attributes);
        $field->setValue('Jane+sales@gmial.com');
        self::assertFalse($field->isSuggestEmailCorrections());
        self::assertStringNotContainsString('data-freeform-email-suggestions', $field->getInputHtml());
        $serializer = (new \ReflectionClass(ManifestFieldSerializer::class))->newInstanceWithoutConstructor();
        $serialize = new \ReflectionMethod($serializer, 'serializeFrontendConfig');
        self::assertSame([], $serialize->invoke($serializer, $form, $field));
        $setting = new \ReflectionProperty($field, 'suggestEmailCorrections');
        $setting->setValue($field, true);
        $html = $field->getInputHtml();
        self::assertStringContainsString('data-freeform-email-suggestions', $html);
        self::assertStringContainsString('type="email"', $html);
        self::assertStringContainsString('aria-describedby="help errors"', $html);
        self::assertStringContainsString('maxlength="200"', $html);
        self::assertStringContainsString('Did you mean {suggestion}?', $html);
        self::assertSame('Jane+sales@gmial.com', $field->getValue());
        $config = $serialize->invoke($serializer, $form, $field);
        self::assertTrue($config['suggestEmailCorrections']);
        self::assertSame(['message' => 'Did you mean {suggestion}?', 'action' => 'Use suggestion'], $config['emailSuggestionLabels']);
        $setting->setValue($field, false);
        self::assertStringNotContainsString('data-freeform-email-suggestions', $field->getInputHtml());
        self::assertSame([], $serialize->invoke($serializer, $form, $field));
    }
}
