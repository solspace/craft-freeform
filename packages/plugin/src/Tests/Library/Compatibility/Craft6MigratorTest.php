<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use CraftCms\Yii2Adapter\Database\MigrationWrapper;
use Illuminate\Container\Container;
use Illuminate\Database\ConnectionResolverInterface;
use Illuminate\Database\Migrations\MigrationRepositoryInterface;
use Illuminate\Filesystem\Filesystem;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Compatibility\FreeformMigrator;

#[CoversClass(FreeformMigrator::class)]
class Craft6MigratorTest extends TestCase
{
    public function testResolvesNamespacedYiiMigrationFromRelocatedFile(): void
    {
        $previousContainer = Container::getInstance();
        Container::setInstance(new Container());

        try {
            $path = \dirname(__DIR__, 4).'/migrations/m260807_145446_BackfillEmptyFormSitesMap.php';

            require_once $path;
            $class = 'Solspace\Freeform\migrations\m260807_145446_BackfillEmptyFormSitesMap';
            app()->instance($class, new \ReflectionClass($class)->newInstanceWithoutConstructor());
            $migrator = new FreeformMigrator(
                $this->createMock(MigrationRepositoryInterface::class),
                $this->createMock(ConnectionResolverInterface::class),
                new Filesystem(),
            );
            $resolvePath = new \ReflectionMethod($migrator, 'resolvePath');

            self::assertInstanceOf(MigrationWrapper::class, $resolvePath->invoke($migrator, $path));
            self::assertInstanceOf(MigrationWrapper::class, $migrator->resolve(basename($path, '.php')));
        } finally {
            Container::setInstance($previousContainer);
        }
    }

    public function testPreservesLaravelMigrationNameResolution(): void
    {
        $migrator = new \ReflectionClass(FreeformMigrator::class)->newInstanceWithoutConstructor();
        $class = new \ReflectionMethod($migrator, 'getMigrationClass')
            ->invoke($migrator, '2026_10_01_120000_create_forms_table')
        ;

        self::assertSame('CreateFormsTable', $class);
    }
}
