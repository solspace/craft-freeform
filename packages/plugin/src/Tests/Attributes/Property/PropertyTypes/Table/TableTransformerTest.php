<?php

namespace Solspace\Freeform\Tests\Attributes\Property\PropertyTypes\Table;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Implementations\Table\TableTransformer;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Properties\Table\TableLayout;

#[CoversClass(TableTransformer::class)]
class TableTransformerTest extends TestCase
{
    public function testTransform(): void
    {
        $value = [
            ['label' => 'Col 1', 'value' => 'one', 'type' => 'text', 'required' => true],
            ['label' => 'Col 2', 'value' => 'two', 'type' => 'checkbox', 'checked' => true],
            ['label' => 'Col 3', 'value' => 'three', 'type' => 'select', 'options' => ['one', 'two', 'three']],
            ['label' => 'Col 4', 'value' => '', 'type' => 'file', 'metadata' => ['fileCount' => 3, 'maxFileSizeKB' => 4096]],
            [
                'label' => 'Col 5',
                'value' => '10.50',
                'type' => 'number',
                'metadata' => [
                    'minLength' => 1,
                    'maxLength' => 8,
                    'decimalCount' => 2,
                    'step' => 0.5,
                    'minMaxValues' => [0, 100],
                ],
            ],
        ];

        $output = (new TableTransformer())->transform($value);

        $expected = new TableLayout();
        $expected
            ->add('Col 1', 'one', TableField::COLUMN_TYPE_STRING, required: true)
            ->add('Col 2', 'two', TableField::COLUMN_TYPE_CHECKBOX, checked: true)
            ->add('Col 3', 'three', TableField::COLUMN_TYPE_DROPDOWN, options: ['one', 'two', 'three'])
            ->add('Col 4', '', TableField::COLUMN_TYPE_FILE, metadata: ['fileCount' => 3, 'maxFileSizeKB' => 4096])
            ->add(
                'Col 5',
                '10.50',
                TableField::COLUMN_TYPE_NUMBER,
                metadata: [
                    'minLength' => 1,
                    'maxLength' => 8,
                    'decimalCount' => 2,
                    'step' => 0.5,
                    'minMaxValues' => [0, 100],
                ],
            )
        ;

        $this->assertEquals($expected, $output);
    }

    public function testReverseTransform(): void
    {
        $value = new TableLayout();
        $value
            ->add(
                'Col 1',
                'one',
                TableField::COLUMN_TYPE_STRING,
                'Enter Text',
            )
            ->add(
                'Col 2',
                'two',
                TableField::COLUMN_TYPE_CHECKBOX,
                checked: true,
            )
            ->add(
                'Col 3',
                'three',
                TableField::COLUMN_TYPE_DROPDOWN,
                options: ['three', 'four', 'five'],
                required: true,
            )
            ->add(
                'Col 4',
                '',
                TableField::COLUMN_TYPE_FILE,
                metadata: [
                    'fileCount' => 2,
                    'maxFileSizeKB' => 4096,
                    'fileKinds' => ['image'],
                    'assetSourceId' => 5,
                    'uploadLocation' => 'uploads/freeform',
                ],
            )
            ->add(
                'Col 5',
                '10.50',
                TableField::COLUMN_TYPE_NUMBER,
                placeholder: 'Amount',
                metadata: [
                    'minLength' => 1,
                    'maxLength' => 8,
                    'decimalCount' => 2,
                    'step' => 0.5,
                    'minMaxValues' => [0, 100],
                ],
            )
        ;

        $output = (new TableTransformer())->reverseTransform($value);

        $expected = [
            [
                'label' => 'Col 1',
                'value' => 'one',
                'type' => 'text',
                'placeholder' => 'Enter Text',
                'options' => [],
                'checked' => false,
                'required' => false,
                'metadata' => [],
            ],
            [
                'label' => 'Col 2',
                'value' => 'two',
                'type' => 'checkbox',
                'placeholder' => '',
                'options' => [],
                'checked' => true,
                'required' => false,
                'metadata' => [],
            ],
            [
                'label' => 'Col 3',
                'value' => 'three',
                'type' => 'select',
                'placeholder' => '',
                'options' => ['three', 'four', 'five'],
                'checked' => false,
                'required' => true,
                'metadata' => [],
            ],
            [
                'label' => 'Col 4',
                'value' => '',
                'type' => 'file',
                'placeholder' => '',
                'options' => [],
                'checked' => false,
                'required' => false,
                'metadata' => [
                    'fileCount' => 2,
                    'maxFileSizeKB' => 4096,
                    'fileKinds' => ['image'],
                    'assetSourceId' => 5,
                    'uploadLocation' => 'uploads/freeform',
                ],
            ],
            [
                'label' => 'Col 5',
                'value' => '10.50',
                'type' => 'number',
                'placeholder' => 'Amount',
                'options' => [],
                'checked' => false,
                'required' => false,
                'metadata' => [
                    'minLength' => 1,
                    'maxLength' => 8,
                    'decimalCount' => 2,
                    'step' => 0.5,
                    'minMaxValues' => [0, 100],
                ],
            ],
        ];

        $this->assertEquals($expected, $output);
    }
}
