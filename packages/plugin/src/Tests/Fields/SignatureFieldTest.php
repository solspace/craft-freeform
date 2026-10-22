<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\DataProviderExternal;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Translations\TranslationTable;
use Solspace\Freeform\Tests\Fixtures\SignatureImages;
use Twig\Environment;
use Twig\Loader\ArrayLoader;

#[CoversClass(SignatureField::class)]
class SignatureFieldTest extends TestCase
{
    #[DataProviderExternal(SignatureImages::class, 'validImages')]
    public function testSavedSignaturesRemainAvailableToLegacyTemplates(string $value, string $mimeType): void
    {
        $value = trim($value);
        $field = $this->getMockBuilder(SignatureField::class)
            ->setConstructorArgs([$this->createMock(Form::class)])
            ->onlyMethods(['getAttributes', 'getHandle', 'getIdAttribute', 'getRequiredAttribute', 'getTranslationTable', 'getLabel'])
            ->getMock()
        ;
        $field->method('getAttributes')->willReturn(new FieldAttributesCollection());
        $field->method('getHandle')->willReturn('signature');
        $field->method('getIdAttribute')->willReturn('signature-pad');
        $field->method('getRequiredAttribute')->willReturn('required');
        $field->method('getTranslationTable')->willReturn(new TranslationTable());
        $field->method('getLabel')->willReturn('Signature');
        $field->setValue($value);
        (new \ReflectionProperty(SignatureField::class, 'showClearButton'))->setValue($field, false);

        $document = new \DOMDocument();
        $previous = libxml_use_internal_errors(true);
        $document->loadHTML((new \ReflectionMethod($field, 'getInputHtml'))->invoke($field));
        libxml_clear_errors();
        libxml_use_internal_errors($previous);
        $input = $document->getElementsByTagName('input')->item(0);
        self::assertSame('signature', $input->getAttribute('name'));
        self::assertSame($value, $input->getAttribute('value'));
        $canvas = $document->getElementsByTagName('canvas')->item(0);
        self::assertTrue($canvas->hasAttribute('data-signature-field'));
        self::assertSame('signature-pad', $canvas->getAttribute('id'));
        self::assertSame('400', $canvas->getAttribute('width'));
        self::assertSame('100', $canvas->getAttribute('height'));

        $twig = new Environment(new ArrayLoader([
            'legacy' => '<img src="{{ field.value }}" />{{ field.readableOutputValue }}',
        ]), ['autoescape' => 'html']);
        self::assertSame(
            '<img src="'.$value.'" /><img src="'.$value.'" alt="Signature" />',
            $twig->render('legacy', ['field' => $field]),
        );
        self::assertSame($value, $field->getValue());
    }

    #[DataProvider('inputAttributes')]
    public function testRendersWithoutWarningsAndRespectsCustomMargins(array $input, string $expectedStyle): void
    {
        $attributes = new FieldAttributesCollection(['input' => $input]);
        $original = $attributes->getInput()->toArray();
        $field = $this->getMockBuilder(SignatureField::class)
            ->setConstructorArgs([$this->createMock(Form::class)])
            ->onlyMethods(['getAttributes', 'getHandle', 'getIdAttribute', 'getRequiredAttribute', 'getTranslationTable'])
            ->getMock()
        ;
        $field->method('getAttributes')->willReturn($attributes);
        $field->method('getHandle')->willReturn('signature');
        $field->method('getIdAttribute')->willReturn('signature-pad');
        $field->method('getRequiredAttribute')->willReturn('required');
        $field->method('getTranslationTable')->willReturn(new TranslationTable());

        // Craft promotes PHP warnings to exceptions during normal and AJAX rendering.
        set_error_handler(static function (int $severity, string $message, string $file, int $line): never {
            throw new \ErrorException($message, 0, $severity, $file, $line);
        }, \E_WARNING);

        try {
            $html = (new \ReflectionMethod($field, 'getInputHtml'))->invoke($field);
        } finally {
            restore_error_handler();
        }

        $document = new \DOMDocument();
        $previous = libxml_use_internal_errors(true);
        $document->loadHTML($html);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);
        $button = $document->getElementsByTagName('button')->item(0);
        self::assertSame('button', $button->getAttribute('type'));
        self::assertTrue($button->hasAttribute('data-signature-clear'));
        self::assertSame($expectedStyle, $button->getAttribute('style'));
        self::assertSame('signature', $document->getElementsByTagName('input')->item(0)->getAttribute('name'));
        self::assertSame('signature-pad', $document->getElementsByTagName('canvas')->item(0)->getAttribute('id'));

        // Rendering uses a clone and must not add button attributes to the field.
        self::assertSame($original, $attributes->getInput()->toArray());
    }

    public static function inputAttributes(): array
    {
        return [
            'defaults' => [[], 'margin-top: 10px;'],
            'mixed values' => [['class' => ['signature', 'clear'], 'data-test' => null, 'disabled' => false], 'margin-top: 10px;'],
            'custom margin' => [['style' => 'color: red; margin-bottom: 4px;'], 'color: red; margin-bottom: 4px;'],
            'array style' => [['style' => ['color: red;', 'margin: 0;']], 'color: red; margin: 0;'],
            'uppercase style' => [['STYLE' => 'margin-left: 8px;'], 'margin-left: 8px;'],
            'null style' => [['style' => null], 'margin-top: 10px;'],
            'boolean style' => [['style' => false], 'margin-top: 10px;'],
            'numeric style' => [['style' => 0], 'margin-top: 10px;'],
        ];
    }
}
