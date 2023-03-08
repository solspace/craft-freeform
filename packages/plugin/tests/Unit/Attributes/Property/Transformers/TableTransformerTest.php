<?php

namespace Solspace\Tests\Freeform\Unit\Attributes\Property\Transformers;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Transformers\TableTransformer;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Properties\Table\TableProperty;

/**
 * @internal
 *
 * @coversNothing
 */
class TableTransformerTest extends TestCase
{
    public function testTransform()
    {
        $value = [
            ['label' => 'Col 1', 'value' => 'one', 'type' => 'string'],
            ['label' => 'Col 2', 'value' => 'two', 'type' => 'checkbox'],
            ['label' => 'Col 3', 'value' => 'three;four;five', 'type' => 'select'],
        ];

        $output = (new TableTransformer())->transform($value);

        $expected = new TableProperty();
        $expected
            ->add('Col 1', 'one', TableField::COLUMN_TYPE_STRING)
            ->add('Col 2', 'two', TableField::COLUMN_TYPE_CHECKBOX)
            ->add('Col 3', 'three;four;five', TableField::COLUMN_TYPE_SELECT)
        ;

        $this->assertEquals($expected, $output);
    }

    public function testReverseTransform()
    {
        $value = new TableProperty();
        $value
            ->add('Col 1', 'one', TableField::COLUMN_TYPE_STRING)
            ->add('Col 2', 'two', TableField::COLUMN_TYPE_CHECKBOX)
            ->add('Col 3', 'three;four;five', TableField::COLUMN_TYPE_SELECT)
        ;

        $output = (new TableTransformer())->reverseTransform($value);

        $expected = [
            ['label' => 'Col 1', 'value' => 'one', 'type' => 'string'],
            ['label' => 'Col 2', 'value' => 'two', 'type' => 'checkbox'],
            ['label' => 'Col 3', 'value' => 'three;four;five', 'type' => 'select'],
        ];

        $this->assertEquals($expected, $output);
    }
}
