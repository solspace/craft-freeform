<?php

namespace Solspace\Freeform\Tests\Migrations;

use craft\db\Connection;
use craft\db\mysql\Schema;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\migrations\m261022_055826_FixLegacyStatusColorColumn;
use yii\db\ColumnSchema;
use yii\db\ColumnSchemaBuilder;
use yii\db\TableSchema;

#[CoversClass(m261022_055826_FixLegacyStatusColorColumn::class)]
class FixLegacyStatusColorColumnTest extends TestCase
{
    public function testNonMysqlDatabasesAreNotInspectedOrAltered(): void
    {
        $migration = $this->migration(null, false);
        $migration->expects($this->never())->method('alterColumn');

        $this->assertTrue($migration->safeUp());
    }

    public function testMissingTableIsLeftAlone(): void
    {
        $migration = $this->migration(null);
        $migration->expects($this->never())->method('alterColumn');

        $this->assertTrue($migration->safeUp());
    }

    public function testMissingColorColumnIsLeftAlone(): void
    {
        $migration = $this->migration(new TableSchema());
        $migration->expects($this->never())->method('alterColumn');

        $this->assertTrue($migration->safeUp());
    }

    #[DataProvider('unaffectedTypes')]
    public function testExistingTextColumnsAreNotAltered(string $dbType): void
    {
        $migration = $this->migration($this->table($dbType));
        $migration->expects($this->never())->method('alterColumn');

        $this->assertTrue($migration->safeUp());
    }

    public static function unaffectedTypes(): array
    {
        return [['varchar(30)'], ['varchar(255)'], ['text']];
    }

    public function testLegacyEnumIsConvertedToTheInstallSchema(): void
    {
        $migration = $this->migration($this->table("enum('green','grey','light','turquoise')", ['green', 'grey', 'light', 'turquoise']));
        $migration->expects($this->once())->method('alterColumn')->with(
            '{{%freeform_statuses}}',
            'color',
            $this->callback(static fn (ColumnSchemaBuilder $column) => 'string(30)' === (string) $column),
        );

        $this->assertTrue($migration->safeUp());
    }

    #[DataProvider('unsafeEnumLabels')]
    public function testUnexpectedEnumLabelsCannotBeTruncated(?array $labels): void
    {
        $migration = $this->migration($this->table("enum('custom')", $labels));
        $migration->expects($this->never())->method('alterColumn');
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Cannot safely convert');

        $migration->safeUp();
    }

    public static function unsafeEnumLabels(): array
    {
        return [[null], [[]], [[str_repeat('a', 31)]]];
    }

    public function testAlterFailureIsNotReportedAsSuccess(): void
    {
        $migration = $this->migration($this->table("enum('green')", ['green']));
        $migration->expects($this->once())->method('alterColumn')->willThrowException(new \RuntimeException('ALTER denied'));
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('ALTER denied');

        $migration->safeUp();
    }

    private function migration(?TableSchema $table, bool $mysql = true): m261022_055826_FixLegacyStatusColorColumn
    {
        $db = $this->getMockBuilder(Connection::class)->onlyMethods(['getIsMysql', 'getTableSchema', 'getSchema'])->getMock();
        $db->method('getIsMysql')->willReturn($mysql);
        $db->expects($mysql ? $this->once() : $this->never())->method('getTableSchema')->with('{{%freeform_statuses}}', true)->willReturn($table);
        $schema = $this->getMockBuilder(Schema::class)->setConstructorArgs([['db' => $db]])->onlyMethods(['refresh'])->getMock();
        $db->method('getSchema')->willReturn($schema);

        return $this->getMockBuilder(m261022_055826_FixLegacyStatusColorColumn::class)
            ->setConstructorArgs([['db' => $db]])
            ->onlyMethods(['alterColumn'])
            ->getMock()
        ;
    }

    private function table(string $dbType, ?array $enumValues = null): TableSchema
    {
        $table = new TableSchema();
        $table->columns['color'] = new ColumnSchema(['name' => 'color', 'dbType' => $dbType, 'enumValues' => $enumValues]);

        return $table;
    }
}
