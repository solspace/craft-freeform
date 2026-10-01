<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Freeform;

#[CoversClass(Freeform::class)]
class Craft6MigrationPathTest extends TestCase
{
    public function testCraft6MigratorUsesRelocatedMigrations(): void
    {
        $plugin = new \ReflectionClass(Freeform::class)->newInstanceWithoutConstructor();
        $path = $plugin->getMigrationsPath();

        self::assertDirectoryExists($path);
        self::assertFileExists($path.'/Install.php');
        self::assertFileExists($path.'/m260807_145446_BackfillEmptyFormSitesMap.php');
        self::assertSame($path, $plugin->getMigrationPath());
    }
}
