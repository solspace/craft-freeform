<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Services\Headless\Manifest\ManifestFieldSerializer;

/**
 * @coversNothing
 */
class TextareaAutoGrowTest extends TestCase
{
    public function testOptInMarkupAndManifest(): void
    {
        $form = $this->createMock(Form::class);
        $field = $this->getMockBuilder(TextareaField::class)
            ->setConstructorArgs([$form])
            ->onlyMethods(['getAttributes', 'translate'])
            ->getMock()
        ;
        $field->method('translate')->willReturnCallback(
            static fn (?string $handle, mixed $defaultValue = null) => $defaultValue ?? ''
        );
        $attributes = new FieldAttributesCollection();
        $field->method('getAttributes')->willReturn($attributes);

        $html = new \ReflectionMethod($field, 'getInputHtml');
        self::assertStringNotContainsString('data-freeform-auto-grow', $html->invoke($field));

        (new \ReflectionProperty($field, 'autoGrow'))->setValue($field, true);
        (new \ReflectionProperty($field, 'autoGrowMaxHeight'))->setValue($field, 320);
        (new \ReflectionProperty($field, 'rows'))->setValue($field, 3);
        (new \ReflectionProperty($field, 'showCharacterCount'))->setValue($field, true);

        $output = $html->invoke($field);
        self::assertStringContainsString('data-freeform-auto-grow', $output);
        self::assertStringContainsString('data-freeform-auto-grow-max-height="320"', $output);
        self::assertStringContainsString('rows="3"', $output);

        $serializer = (new \ReflectionClass(ManifestFieldSerializer::class))->newInstanceWithoutConstructor();
        $config = (new \ReflectionMethod($serializer, 'serializeFrontendConfig'))
            ->invoke($serializer, $form, $field)
        ;

        self::assertTrue($config['autoGrow']);
        self::assertSame(320, $config['autoGrowMaxHeight']);
        self::assertSame(3, $config['rows']);
        self::assertTrue($config['showCharacterCount']);
        self::assertArrayHasKey('characterCountMessages', $config);
    }

    public function testDisabledByDefaultAndOmitsMaxHeightWhenBlank(): void
    {
        $form = $this->createMock(Form::class);
        $field = new TextareaField($form);
        $serializer = (new \ReflectionClass(ManifestFieldSerializer::class))->newInstanceWithoutConstructor();
        $serialize = new \ReflectionMethod($serializer, 'serializeFrontendConfig');

        self::assertSame(['rows' => 2], $serialize->invoke($serializer, $form, $field));

        (new \ReflectionProperty($field, 'autoGrow'))->setValue($field, true);
        self::assertSame(
            ['rows' => 2, 'autoGrow' => true],
            $serialize->invoke($serializer, $form, $field)
        );
    }
}
