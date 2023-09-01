<?php

namespace Solspace\Tests\Freeform\Unit\Library\Attributes;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FormAttributesCollection;

/**
 * @internal
 *
 * @coversNothing
 */
class FormAttributesCollectionTest extends TestCase
{
    public function testFormAttributes()
    {
        $attributes = new FormAttributesCollection([
            'novalidate' => true,
            'data-empty' => null,
            'row' => [
                'data-one' => 'one',
                'data-two' => 'two',
            ],
        ]);

        $this->assertCount(2, $attributes);
        $this->assertCount(2, $attributes->getRow());

        $this->assertSame(' novalidate data-empty', (string) $attributes);
        $this->assertSame(' data-one="one" data-two="two"', (string) $attributes->getRow());
    }

    public function testAttributesByType(): void
    {
        $attributes = new FormAttributesCollection([
            '@fields' => [
                'input' => [
                    'class' => 'one',
                ],
                '@text' => [
                    'input' => [
                        'class' => 'text-class',
                        'placeholder' => 'text-placeholder',
                    ],
                ],
                '@dropdown, @text' => [
                    'input' => [
                        'class' => 'dropdown-n-text',
                        'placeholder' => 'dropdown-placeholder',
                    ],
                ],
                '@text, @table' => [
                    'input' => ['class' => 'table-n-text'],
                ],
                '@table' => [
                    'input' => ['class' => 'table-class'],
                ],
            ],
        ]);

        $formMock = $this->createMock(Form::class);
        $formMock->method('getAttributes')->willReturn($attributes);

        $field = new TextField($formMock);

        $output = (string) $field->getCompiledAttributes()->getInput();

        $this->assertSame(' class="one text-class dropdown-n-text table-n-text" placeholder="text-placeholder dropdown-placeholder"', $output);
    }

    public function testAttributesByHandle(): void
    {
        $attributes = new FormAttributesCollection([
            '@fields' => [
                'input' => [
                    'class' => 'one',
                ],
                '#myTextField' => [
                    'input' => ['id' => 'my-text-field'],
                ],
            ],
        ]);

        $formMock = $this->createMock(Form::class);
        $formMock->method('getAttributes')->willReturn($attributes);

        $field = $this
            ->getMockBuilder(TextField::class)
            ->setConstructorArgs([$formMock])
            ->onlyMethods(['getHandle'])
            ->getMock()
        ;

        $field->method('getHandle')->willReturn('myTextField');

        $output = (string) $field->getCompiledAttributes()->getInput();

        $this->assertSame(' class="one" id="my-text-field"', $output);
    }

    public function testAttributesByImplementation(): void
    {
        $attributes = new FormAttributesCollection([
            '@fields' => [
                'input' => [
                    'class' => 'one',
                ],
                ':options' => [
                    'input' => ['class' => 'options-field'],
                ],
            ],
        ]);

        $formMock = $this->createMock(Form::class);
        $formMock->method('getAttributes')->willReturn($attributes);

        $field = new DropdownField($formMock);

        $output = (string) $field->getCompiledAttributes()->getInput();

        $this->assertSame(' class="one options-field"', $output);
    }

    public function testAttributesByMetaStatus(): void
    {
        $attributes = new FormAttributesCollection([
            '@fields' => [
                'label' => [
                    'class' => 'one',
                ],
                ':required' => [
                    'label' => ['class' => 'required'],
                ],
                ':errors' => [
                    'label' => ['class' => 'has-errors'],
                ],
            ],
        ]);

        $formMock = $this->createMock(Form::class);
        $formMock->method('getAttributes')->willReturn($attributes);

        $field = $this
            ->getMockBuilder(TextField::class)
            ->setConstructorArgs([$formMock])
            ->onlyMethods(['getHandle', 'isRequired', 'hasErrors'])
            ->getMock()
        ;

        $field->method('getHandle')->willReturn('myTextField');
        $field->method('isRequired')->willReturn(true);
        $field->method('hasErrors')->willReturn(true);

        $output = (string) $field->getCompiledAttributes()->getLabel();

        $this->assertSame(' class="one required has-errors"', $output);
    }

    public function testAttributesByNotMetaStatus(): void
    {
        $attributes = new FormAttributesCollection([
            '@fields' => [
                'label' => [
                    'class' => 'one',
                ],
                ':required' => [
                    'label' => ['class' => 'required'],
                ],
                ':errors' => [
                    'label' => ['class' => 'has-errors'],
                ],
            ],
        ]);

        $formMock = $this->createMock(Form::class);
        $formMock->method('getAttributes')->willReturn($attributes);

        $field = $this
            ->getMockBuilder(TextField::class)
            ->setConstructorArgs([$formMock])
            ->onlyMethods(['getHandle'])
            ->getMock()
        ;

        $field->method('getHandle')->willReturn('myTextField');

        $output = (string) $field->getCompiledAttributes()->getLabel();

        $this->assertSame(' class="one"', $output);
    }

    public function testAttributesByCombinedStatus(): void
    {
        $attributes = new FormAttributesCollection([
            '@fields' => [
                'label' => [
                    'class' => 'one',
                ],
                ':required, @text, :placeholder, :errors, #myTextField' => [
                    'label' => ['class' => 'combined'],
                ],
            ],
        ]);

        $formMock = $this->createMock(Form::class);
        $formMock->method('getAttributes')->willReturn($attributes);

        $field = $this
            ->getMockBuilder(TextField::class)
            ->setConstructorArgs([$formMock])
            ->onlyMethods(['getHandle', 'hasErrors'])
            ->getMock()
        ;

        $field->method('getHandle')->willReturn('myTextField');
        $field->method('hasErrors')->willReturn(true);

        $output = (string) $field->getCompiledAttributes()->getLabel();

        $this->assertSame(' class="one combined"', $output);
    }

    public function testPassedTableAttributes(): void
    {
        $this->markTestSkipped('This is going to be implemented later');

        $attributes = new FormAttributesCollection([
            '@fields' => [
                'label' => [
                    'class' => 'one',
                ],
                '@table' => [
                    'label' => ['class' => 'two'],
                    'tableAttributes' => [
                        'row' => 'test',
                    ],
                ],
            ],
        ]);

        $formMock = $this->createMock(Form::class);
        $formMock->method('getAttributes')->willReturn($attributes);

        $field = new TableField($formMock);

        $output = (string) $field->getCompiledAttributes()->getLabel();
        $tableOutput = (string) $field->getTableAttributes()->getRow();

        $this->assertSame(' class="one two"', $output);
        $this->assertSame('fdsa', $tableOutput);
    }
}
