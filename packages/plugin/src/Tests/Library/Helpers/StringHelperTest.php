<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\StringHelper;

/**
 * @internal
 *
 * @coversNothing
 */
class StringHelperTest extends TestCase
{
    public function testIncrementStringWithNoNumber()
    {
        $this->assertSame(
            'test string1',
            StringHelper::incrementStringWithNumber('test string')
        );
    }

    public function testIncrementStringWithNumber()
    {
        $this->assertSame(
            'test string154',
            StringHelper::incrementStringWithNumber('test string153')
        );
    }

    public function testIncrementStringWithNoNumberSpaced()
    {
        $this->assertSame(
            'test string 1',
            StringHelper::incrementStringWithNumber('test string', true)
        );
    }

    public function testIncrementStringSpaced()
    {
        $this->assertSame(
            'test string 154',
            StringHelper::incrementStringWithNumber('test string 153', true)
        );
    }

    public function testDashesToCamelCase()
    {
        $this->assertSame(
            '-my--test-worked-',
            StringHelper::dashesToCamelCase('myTestWorked', true)
        );
    }
}
