<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\Validation\WebsiteValidation;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\Implementations\Pro\WebsiteField;
use Solspace\Freeform\Form\Form;

/**
 * @coversNothing
 */
class WebsiteFieldTest extends TestCase
{
    #[DataProvider('websites')]
    public function testNormalizesAndValidatesSubmittedValues(mixed $input, mixed $expected, bool $valid): void
    {
        $form = $this->createMock(Form::class);
        $field = new WebsiteField($form);
        self::assertSame($field, $field->setValue($input));
        self::assertSame($expected, $field->getValue());
        $validator = (new \ReflectionClass(WebsiteValidation::class))->newInstanceWithoutConstructor();
        $validator->validate(new ValidateEvent($form, $field));
        self::assertSame($valid, [] === $field->getErrors());
        if (!$valid) {
            self::assertSame(['Enter a website address, like example.com.'], $field->getErrors());
        }
    }

    public static function websites(): array
    {
        return [
            ['example.com', 'https://example.com', true],
            ['www.example.com', 'https://www.example.com', true],
            ['blog.example.co.uk', 'https://blog.example.co.uk', true],
            ['example.com/Contact?ref=AbC&next=%2FHome#Team', 'https://example.com/Contact?ref=AbC&next=%2FHome#Team', true],
            ['example.com?ref=AbC', 'https://example.com?ref=AbC', true],
            ['example.com#Team', 'https://example.com#Team', true],
            ['//example.com/Contact', 'https://example.com/Contact', true],
            [" \tExample.COM/Contact\n", 'https://Example.COM/Contact', true],
            ["\u{00a0}example.com\u{00a0}", 'https://example.com', true],
            [' http://example.com/Contact ', 'http://example.com/Contact', true],
            ['HTTPS://Example.COM/Contact?ref=AbC#Team', 'HTTPS://Example.COM/Contact?ref=AbC#Team', true],
            ['ftp://example.com/file', 'ftp://example.com/file', true],
            ['sftp://example.com/file', 'sftp://example.com/file', true],
            ['ssh://example.com/file', 'ssh://example.com/file', true],
            ['', '', true], [" \t\n", '', true], [null, null, true],
            ['not a website', 'not a website', false],
            ['mailto:name@example.com', 'mailto:name@example.com', false],
            ['javascript:alert(1)', 'javascript:alert(1)', false],
            ['/relative/path', '/relative/path', false],
            ['https:example.com', 'https:example.com', false],
            ['0', '0', false], [['example.com'], ['example.com'], false], [[], [], false],
        ];
    }

    public function testMarkupRetainsUrlInputAndExistingAttributesWithoutNewSettings(): void
    {
        $field = $this->getMockBuilder(WebsiteField::class)
            ->setConstructorArgs([$this->createMock(Form::class)])
            ->onlyMethods(['getIdAttribute', 'translate', 'getInstructions', 'canRender'])
            ->getMock()
        ;
        $field->method('getIdAttribute')->willReturn('website');
        $field->method('translate')->willReturn('');
        $field->method('getInstructions')->willReturn('');
        $field->method('canRender')->willReturn(true);
        $field->setValue('example.com');
        $field->getParameters()->add('useCustomAttributes', false);
        $html = (new \ReflectionMethod($field, 'getInputHtml'))->invoke($field);
        self::assertStringContainsString('type="url"', $html);
        self::assertStringContainsString('value="https://example.com"', $html);
        self::assertStringContainsString('data-freeform-website', $html);
        self::assertStringContainsString('data-website-error="Enter a website address, like example.com."', $html);
    }
}
