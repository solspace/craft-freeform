<?php

namespace Solspace\Freeform\Tests\Fields\Traits;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Traits\DefaultTextValueTrait;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Translations\TranslationTable;

#[CoversClass(DefaultTextValueTrait::class)]
class DefaultTextValueTraitTest extends TestCase
{
    public function testDefaultValueUsesRawValueWhenNoUiTranslationExists(): void
    {
        $field = $this->createTextField('at');

        $this->assertSame('at', $field->getDefaultValue());
    }

    public function testDefaultValueUsesUiTranslationWhenPresent(): void
    {
        $field = $this->createTextField('at', ['defaultValue' => 'at']);

        $this->assertSame('at', $field->getDefaultValue());
    }

    private function createTextField(string $defaultValue = '', array $translations = []): TextField
    {
        $formMock = $this->createMock(Form::class);

        $field = $this->getMockBuilder(TextField::class)->setConstructorArgs([$formMock])->onlyMethods(['translate', 'getTranslationTable'])->getMock();
        $field->method('translate')->willReturn('um');
        $field->method('getTranslationTable')->willReturn(new TranslationTable($translations));

        $property = new \ReflectionProperty(TextField::class, 'defaultValue');
        $property->setValue($field, $defaultValue);

        return $field;
    }
}
