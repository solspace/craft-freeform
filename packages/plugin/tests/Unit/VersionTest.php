<?php

namespace Solspace\Tests\Freeform\Unit;

use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class VersionTest extends TestCase
{
    public function versionDataProvider()
    {
        return [
            ['1.8.2', '<'],
            ['2.0.0-dev', '='],
            ['2.0.0-alpha.1', '>'],
            ['2.0.0-beta.1', '>'],
        ];
    }

    /**
     * @dataProvider versionDataProvider
     */
    public function testVersions(string $version, string $operator)
    {
        $this->assertTrue(version_compare($version, '2.0.0-dev', $operator));
    }

    public function testCraft31BetaCheck()
    {
        $this->assertTrue(version_compare('3.1.0-beta.4', '3.1', '>='));
    }

    public function testCraft31PreBetaCheck()
    {
        $this->assertTrue(version_compare('3.0.40', '3.1', '<'));
    }
}
