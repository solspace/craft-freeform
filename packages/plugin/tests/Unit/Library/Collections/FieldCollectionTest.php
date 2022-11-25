<?php

namespace Solspace\Tests\Freeform\Unit\Library\Collections;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\TextField;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;

/**
 * @internal
 *
 * @coversNothing
 */
class FieldCollectionTest extends TestCase
{
    public function testCanIterateOverFields()
    {
        $a = $this->createStub(TextField::class);
        $b = $this->createStub(TextField::class);

        $a->method('getHandle')->willReturn('one');
        $b->method('getHandle')->willReturn('two');

        $collection = new FieldCollection([$a, $b]);

        $this->assertCount(2, $collection);

        $table = [[0, 'one'], [1, 'two']];
        $iterator = 0;
        foreach ($collection as $key => $item) {
            [$expectedKey, $expectedHandle] = $table[$iterator++];
            $this->assertInstanceOf(FieldInterface::class, $item);
            $this->assertSame($expectedKey, $key);
            $this->assertSame($expectedHandle, $item->getHandle());
        }
    }

    public function testCanAccessAsAnArrayByHandle()
    {
        $a = $this->createStub(TextField::class);
        $b = $this->createStub(TextField::class);
        $c = $this->createStub(TextField::class);

        $a->method('getHandle')->willReturn('one');
        $b->method('getHandle')->willReturn('two');
        $c->method('getHandle')->willReturn('three');

        $collection = new FieldCollection([$a, $b, $c]);

        $this->assertSame('two', $collection['two']->getHandle());
    }

    public function testGetById()
    {
        $a = $this->createStub(TextField::class);
        $b = $this->createStub(TextField::class);
        $c = $this->createStub(TextField::class);

        $a->method('getHandle')->willReturn('one');
        $a->method('getId')->willReturn(1);
        $b->method('getHandle')->willReturn('two');
        $b->method('getId')->willReturn(2);
        $c->method('getHandle')->willReturn('three');
        $c->method('getId')->willReturn(3);

        $collection = new FieldCollection([$a, $b, $c]);

        $this->assertSame('three', $collection->get(3)->getHandle());
    }

    public function testGetByHandle()
    {
        $a = $this->createStub(TextField::class);
        $b = $this->createStub(TextField::class);
        $c = $this->createStub(TextField::class);

        $a->method('getHandle')->willReturn('one');
        $a->method('getId')->willReturn(1);
        $b->method('getHandle')->willReturn('two');
        $b->method('getId')->willReturn(2);
        $c->method('getHandle')->willReturn('three');
        $c->method('getId')->willReturn(3);

        $collection = new FieldCollection([$a, $b, $c]);

        $this->assertSame(1, $collection->get('one')->getId());
    }

    public function testSeeIfTypeExistsInCollection()
    {
        $a = $this->createStub(TextField::class);
        $b = $this->createStub(TextField::class);
        $c = $this->createStub(TextField::class);

        $a->method('getType')->willReturn('text');
        $b->method('getType')->willReturn('text');
        $c->method('getType')->willReturn('textarea');

        $collection = new FieldCollection([$a, $b, $c]);

        $this->assertTrue($collection->hasFieldType('text'));
        $this->assertTrue($collection->hasFieldType('textarea'));
        $this->assertFalse($collection->hasFieldType('checkbox'));
    }
}
