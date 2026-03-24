<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\ArrayHelper;

#[CoversClass(ArrayHelper::class)]
class ArrayHelperTest extends TestCase
{
    public function testSome(): void
    {
        $array = [1, 'two', false, 'foo' => 'bar'];

        $this->assertTrue(ArrayHelper::some($array, static fn ($item) => 1 === $item));
        $this->assertTrue(ArrayHelper::some($array, static fn ($item) => 'two' === $item));
        $this->assertTrue(ArrayHelper::some($array, static fn ($item) => false === $item));
        $this->assertTrue(ArrayHelper::some($array, static fn ($item, $key) => 'foo' === $key && 'bar' === $item));

        $this->assertFalse(ArrayHelper::some($array, static fn ($item) => 'non-existent' === $item));
    }

    public function testSomeRecursive(): void
    {
        $array = [1, 'two', false, [1, 'two', false]];

        $this->assertTrue(ArrayHelper::someRecursive($array, static fn ($item) => 1 === $item));
        $this->assertTrue(ArrayHelper::someRecursive($array, static fn ($item) => 'two' === $item));
        $this->assertTrue(ArrayHelper::someRecursive($array, static fn ($item) => false === $item));

        $this->assertFalse(ArrayHelper::someRecursive($array, static fn ($item) => 'non-existent' === $item));
    }

    public function testEvery(): void
    {
        $array = [1, 2, 3, 4];

        $this->assertTrue(ArrayHelper::every($array, static fn ($item) => $item > 0 && $item < 5));
        $this->assertFalse(ArrayHelper::every($array, static fn ($item) => $item > 1));
        $this->assertFalse(ArrayHelper::every($array, static fn ($item) => $item < 4));
    }

    public function testEveryRecursive(): void
    {
        $array = [1, 2, 3, 4, [1, 2, 3, 4]];

        $this->assertTrue(ArrayHelper::everyRecursive($array, static fn ($item) => $item > 0 && $item < 5));
        $this->assertFalse(ArrayHelper::everyRecursive($array, static fn ($item) => $item > 1));
        $this->assertFalse(ArrayHelper::everyRecursive($array, static fn ($item) => $item < 4));
    }

    public function testFlattenKeys(): void
    {
        $input = [
            'key:0->1' => 'value->1',
            'key:0->2' => [
                'key:1->1' => 'value->2',
            ],
            'key:0->3' => 'value->3',
            'key:0->4' => [
                'key:1->1' => [
                    'key:2->1' => 'value->4',
                    'key:2->2' => 'value->5',
                ],
                'key:1->2' => 'value->6',
            ],
        ];

        $expectedOutput = [
            'key:0->1' => 'value->1',
            'key:0->2.key:1->1' => 'value->2',
            'key:0->3' => 'value->3',
            'key:0->4.key:1->1.key:2->1' => 'value->4',
            'key:0->4.key:1->1.key:2->2' => 'value->5',
            'key:0->4.key:1->2' => 'value->6',
        ];

        $this->assertSame(
            $expectedOutput,
            ArrayHelper::keyFlatten($input)
        );
    }

    public function testGenerate(): void
    {
        $iterations = 5;
        $result = ArrayHelper::generate($iterations, static fn ($i) => ["key-{$i}", "value-{$i}"]);

        $this->assertCount($iterations, $result);
        $this->assertSame(
            [
                'key-0' => 'value-0',
                'key-1' => 'value-1',
                'key-2' => 'value-2',
                'key-3' => 'value-3',
                'key-4' => 'value-4',
            ],
            $result
        );
    }
}
