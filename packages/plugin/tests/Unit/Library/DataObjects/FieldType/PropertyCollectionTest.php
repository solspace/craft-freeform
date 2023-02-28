<?php

namespace Solspace\Tests\Freeform\Unit\Library\DataObjects\FieldType;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\DataObjects\FieldType\Property;
use Solspace\Freeform\Library\DataObjects\FieldType\PropertyCollection;

/**
 * @internal
 *
 * @coversNothing
 */
class PropertyCollectionTest extends TestCase
{
    public function testRemovesOneFlagged()
    {
        $prop1 = new Property();
        $prop1->flags = ['test', 'flag'];

        $prop2 = new Property();
        $prop2->flags = ['test', 'other'];

        $collection = new PropertyCollection();
        $collection
            ->add($prop1)
            ->add($prop2)
        ;

        $this->assertCount(2, $collection);

        $collection->removeFlagged('flag');

        $this->assertCount(1, $collection);
    }

    public function testRemovesMultipleFlagged()
    {
        $prop1 = new Property();
        $prop1->flags = ['test', 'flag'];

        $prop2 = new Property();
        $prop2->flags = ['test', 'other'];

        $collection = new PropertyCollection();
        $collection
            ->add($prop1)
            ->add($prop2)
        ;

        $this->assertCount(2, $collection);

        $collection->removeFlagged('test');

        $this->assertCount(0, $collection);
    }

    public function testRemovesVariousFlags()
    {
        $prop1 = new Property();
        $prop1->flags = ['test', 'flag'];

        $prop2 = new Property();
        $prop2->flags = ['test', 'other'];

        $collection = new PropertyCollection();
        $collection
            ->add($prop1)
            ->add($prop2)
        ;

        $this->assertCount(2, $collection);

        $collection->removeFlagged('flag', 'other');

        $this->assertCount(0, $collection);
    }
}
