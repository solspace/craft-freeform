<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\FileHelper;

/**
 * @internal
 *
 * @coversNothing
 */
class FileHelperTest extends TestCase
{
    /**
     * @dataProvider pathDataProvider
     *
     * @param string $path
     * @param bool   $expected
     */
    public function testIsAbsolute($path, $expected)
    {
        $this->assertSame($expected, FileHelper::isAbsolute($path), $path);
    }

    public function pathDataProvider(): array
    {
        return [
            ['/path/to/file', true],
            ['path/to/file', false],
            ['C:\path\to\file', true],
            ['D:/path/to/file', true],
            ['ZD:\path\to\file', true],
            ['//path/to/file', true],
        ];
    }
}
