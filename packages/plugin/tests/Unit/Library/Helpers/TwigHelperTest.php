<?php

namespace Solspace\Tests\Freeform\Unit\Library\Helpers;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\TwigHelper;

/**
 * @internal
 *
 * @coversNothing
 */
class TwigHelperTest extends TestCase
{
    public function testIsTwigValue()
    {
        $this->assertFalse(TwigHelper::isTwigValue(''));
        $this->assertFalse(TwigHelper::isTwigValue('12345'));
        $this->assertFalse(TwigHelper::isTwigValue('123, 45'));
        $this->assertTrue(TwigHelper::isTwigValue('{{ "12345" }}'));
        $this->assertTrue(TwigHelper::isTwigValue('{{ fieldHandle.value }}'));
        $this->assertTrue(TwigHelper::isTwigValue('{{ submission.fieldhandle.value }}'));
    }
}
