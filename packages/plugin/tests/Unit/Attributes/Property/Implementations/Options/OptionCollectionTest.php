<?php

namespace Solspace\Tests\Freeform\Unit\Attributes\Property\Implementations\Options;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;

/**
 * @internal
 *
 * @coversNothing
 */
class OptionCollectionTest extends TestCase
{
    public function testNestedChildren()
    {
        $collection = new OptionCollection();
        $collection->add('one', 'One');
        $collection->add('two', 'Two', true);
        $collection->addCollection(
            (new OptionCollection('Nested Collection'))
                ->add('nested_one', 'Nested One')
                ->add('nested_two', 'Nested Two', true)
        );
        $collection->addCollection(
            (new OptionCollection('Nested Second Collection'))
                ->add('nested2_one', 'Nested 2 One')
                ->add('nested2_two', 'Nested 2 Two')
                ->addCollection(
                    (new OptionCollection('Sub Nesting'))
                        ->add('sub_nesting', 'Sub Nesting'),
                )
        );

        $this->assertEquals(
            [
                ['value' => 'one', 'label' => 'One', 'checked' => false],
                ['value' => 'two', 'label' => 'Two', 'checked' => true],
                [
                    'label' => 'Nested Collection',
                    'children' => [
                        ['value' => 'nested_one', 'label' => 'Nested One', 'checked' => false],
                        ['value' => 'nested_two', 'label' => 'Nested Two', 'checked' => true],
                    ],
                ],
                [
                    'label' => 'Nested Second Collection',
                    'children' => [
                        ['value' => 'nested2_one', 'label' => 'Nested 2 One', 'checked' => false],
                        ['value' => 'nested2_two', 'label' => 'Nested 2 Two', 'checked' => false],
                        [
                            'label' => 'Sub Nesting',
                            'children' => [
                                ['value' => 'sub_nesting', 'label' => 'Sub Nesting', 'checked' => false],
                            ],
                        ],
                    ],
                ],
            ],
            $collection->toArray()
        );
    }
}
