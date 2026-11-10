<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Migrations\Craft6SchemaMigration;

#[CoversClass(Craft6SchemaMigration::class)]
class Craft6SchemaMigrationTest extends TestCase
{
    public function testSchemaChangesDoNotRequireAnAdapterTransaction(): void
    {
        $migration = $this->getMockBuilder(Craft6SchemaMigration::class)
            ->disableOriginalConstructor()->onlyMethods(['safeUp', 'afterUp'])->getMock()
        ;
        $migration->expects(self::once())->method('safeUp')->willReturn(true);
        $migration->expects(self::once())->method('afterUp');

        self::assertTrue($migration->up());
    }

    public function testFailedSchemaChangesReachTheNativeMigrator(): void
    {
        $migration = $this->getMockBuilder(Craft6SchemaMigration::class)
            ->disableOriginalConstructor()->onlyMethods(['safeUp', 'afterUp'])->getMock()
        ;
        $migration->method('safeUp')->willReturn(false);
        $migration->expects(self::never())->method('afterUp');

        $this->expectException(\RuntimeException::class);
        $migration->up();
    }

    public function testSchemaExceptionsAreNotSwallowed(): void
    {
        $migration = $this->getMockBuilder(Craft6SchemaMigration::class)
            ->disableOriginalConstructor()->onlyMethods(['safeUp'])->getMock()
        ;
        $migration->method('safeUp')->willThrowException(new \RuntimeException('Schema failed'));

        $this->expectExceptionMessage('Schema failed');
        $migration->up();
    }
}
