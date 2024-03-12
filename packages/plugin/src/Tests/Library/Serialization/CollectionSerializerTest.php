<?php

namespace Solspace\Freeform\Tests\Library\Serialization;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Collections\Collection;
use Solspace\Freeform\Library\Serialization\FreeformSerializer;

/**
 * @internal
 *
 * @coversNothing
 */
class CollectionSerializerTest extends TestCase
{
    public function testToArrayCustomNormalizer()
    {
        $test = new class() extends Collection {};
        $test->add('test');

        $serializer = new FreeformSerializer();
        $output = $serializer->serialize($test, 'json');

        $this->assertSame(
            '["test"]',
            $output
        );
    }

    public function testEmptyToArraySerialize()
    {
        $test = new class() extends Collection {};

        $serializer = new FreeformSerializer();
        $output = $serializer->serialize($test, 'json');

        $this->assertSame(
            '[]',
            $output
        );
    }
}
