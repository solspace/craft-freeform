<?php

namespace Solspace\Tests\Freeform\Unit\Library\Helpers;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\ArrayHelper;

/**
 * @internal
 *
 * @coversNothing
 */
class ArrayHelperTest extends TestCase
{
    public function testSome(): void
    {
        $array = [1, 'two', false];

        $this->assertTrue(ArrayHelper::some($array, fn ($item) => 1 === $item));
        $this->assertTrue(ArrayHelper::some($array, fn ($item) => 'two' === $item));
        $this->assertTrue(ArrayHelper::some($array, fn ($item) => false === $item));

        $this->assertFalse(ArrayHelper::some($array, fn ($item) => 'non-existent' === $item));
    }

    public function testEvery(): void
    {
        $array = [1, 2, 3, 4];

        $this->assertTrue(ArrayHelper::every($array, fn ($item) => $item > 0 && $item < 5));
        $this->assertFalse(ArrayHelper::every($array, fn ($item) => $item > 1));
        $this->assertFalse(ArrayHelper::every($array, fn ($item) => $item < 4));
    }
}
