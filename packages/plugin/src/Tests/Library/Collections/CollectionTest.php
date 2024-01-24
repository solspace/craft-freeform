<?php

namespace Solspace\Freeform\Tests\Library\Collections;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @internal
 *
 * @coversNothing
 */
class CollectionTest extends TestCase
{
    public function testChecksForImplementation()
    {
        $collection = new class() extends Collection {
            protected static function supports(): array
            {
                return [\JsonSerializable::class, \ArrayAccess::class];
            }
        };

        $first = new class() implements \JsonSerializable {
            public string $test = 'test';

            public function jsonSerialize(): array
            {
                return ['variable' => $this->test];
            }
        };

        $collection->add($first);

        $second = new class() implements \ArrayAccess {
            public function offsetExists(mixed $offset): bool
            {
                return true;
            }

            public function offsetGet(mixed $offset): string
            {
                return 'test';
            }

            public function offsetSet(mixed $offset, mixed $value): void {}

            public function offsetUnset(mixed $offset): void {}
        };

        $collection->add($second);

        $this->assertCount(2, $collection);
    }

    public function testThrowsOnInvalidType()
    {
        $object = new class() {
            public string $test = 'test';
        };

        $collection = new class() extends Collection {
            protected static function supports(): array
            {
                return [\JsonSerializable::class];
            }
        };

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Valid implementations are: JsonSerializable');

        $collection->add($object);
    }
}
