<?php

namespace Library\Helpers;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\RecursiveArrayHelper;

#[CoversClass(RecursiveArrayHelper::class)]
class RecursiveArrayHelperTest extends TestCase
{
    public function testSome(): void
    {
        $array = [1, 'two', false, [1, 'two', false]];

        $this->assertTrue(RecursiveArrayHelper::some($array, fn ($item) => 1 === $item));
        $this->assertTrue(RecursiveArrayHelper::some($array, fn ($item) => 'two' === $item));
        $this->assertTrue(RecursiveArrayHelper::some($array, fn ($item) => false === $item));

        $this->assertFalse(RecursiveArrayHelper::some($array, fn ($item) => 'non-existent' === $item));
    }

    public function testEvery(): void
    {
        $array = [1, 2, 3, 4, [1, 2, 3, 4]];

        $this->assertTrue(RecursiveArrayHelper::every($array, fn ($item) => $item > 0 && $item < 5));
        $this->assertFalse(RecursiveArrayHelper::every($array, fn ($item) => $item > 1));
        $this->assertFalse(RecursiveArrayHelper::every($array, fn ($item) => $item < 4));
    }
}
