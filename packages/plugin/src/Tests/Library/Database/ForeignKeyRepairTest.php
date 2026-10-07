<?php

namespace Solspace\Freeform\Tests\Library\Database;

use craft\db\Connection;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Database\ForeignKeyRepair;
use yii\db\ColumnSchema;
use yii\db\Command;
use yii\db\ForeignKeyConstraint;
use yii\db\mysql\Schema;
use yii\db\TableSchema;

#[CoversClass(ForeignKeyRepair::class)]
class ForeignKeyRepairTest extends TestCase
{
    private const DEFINITION = [null, '{{%freeform_submissions_contact_1}}', 'id', '{{%freeform_submissions}}', 'id', 'CASCADE', null];

    public function testInspectionDoesNotExecuteWrites(): void
    {
        [$repair, $command] = $this->fixture();
        $command->expects($this->never())->method('execute');
        $command->expects($this->never())->method('addForeignKey');

        $this->assertSame('missing', $repair->inspect(self::DEFINITION)['status']);
    }

    public function testExistingKeysAreRecognizedByRelationshipRatherThanName(): void
    {
        [$repair, $command] = $this->fixture([$this->key()]);
        $command->expects($this->never())->method('execute');

        $this->assertSame('ok', $repair->inspect(self::DEFINITION)['status']);
        $repair->restore(self::DEFINITION);
    }

    public function testDifferentCascadeActionIsReportedAndNeverReplaced(): void
    {
        $key = $this->key();
        $key->onDelete = 'RESTRICT';
        [$repair, $command] = $this->fixture([$key]);
        $command->expects($this->never())->method('execute');

        $this->assertSame('conflict', $repair->inspect(self::DEFINITION)['status']);
        $this->expectException(\RuntimeException::class);
        $repair->restore(self::DEFINITION);
    }

    public function testDifferentReferencedTableIsReported(): void
    {
        $key = $this->key();
        $key->foreignTableName = 'craft_elements';
        [$repair] = $this->fixture([$key]);

        $this->assertSame('conflict', $repair->inspect(self::DEFINITION)['status']);
    }

    public function testExplicitUpdateActionIsChecked(): void
    {
        $definition = self::DEFINITION;
        $definition[6] = 'CASCADE';
        [$repair] = $this->fixture([$this->key()]);

        $this->assertSame('conflict', $repair->inspect($definition)['status']);
    }

    public function testOrphansBlockRestorationWithoutDeletingData(): void
    {
        [$repair, $command] = $this->fixture([], 7);
        $command->expects($this->never())->method('execute');
        $result = $repair->inspect(self::DEFINITION);
        $this->assertSame('blocked', $result['status']);
        $this->assertSame(7, $result['orphanCount']);

        $this->expectException(\RuntimeException::class);
        $repair->restore(self::DEFINITION);
    }

    public function testExistingKeysWithOrphansAreAlsoReported(): void
    {
        [$repair] = $this->fixture([$this->key()], 2);

        $this->assertSame('blocked', $repair->inspect(self::DEFINITION)['status']);
    }

    public function testMissingColumnsAreReportedBeforeQueryingRows(): void
    {
        [$repair, $command, $schema, $tables] = $this->fixture();
        unset($tables['craft_freeform_submissions']->columns['id']);
        $command->expects($this->never())->method('queryScalar');

        $this->assertSame('blocked', $repair->inspect(self::DEFINITION)['status']);
    }

    public function testMissingTablesAreReportedBeforeQueryingRows(): void
    {
        [$repair, $command] = $this->fixture([], 0, false);
        $command->expects($this->never())->method('queryScalar');

        $this->assertSame('blocked', $repair->inspect(self::DEFINITION)['status']);
    }

    public function testRestorationRefreshesMetadataAndIsIdempotent(): void
    {
        [$repair, $command, $schema, , , $state] = $this->fixture();
        $key = $this->key();
        $schema->expects($this->once())->method('refreshTableSchema')->with(self::DEFINITION[1]);
        $command->expects($this->once())->method('addForeignKey')->with(
            $this->callback(static fn ($name) => str_starts_with($name, 'fk_ff_repair_') && \strlen($name) <= 63),
            self::DEFINITION[1],
            'id',
            self::DEFINITION[3],
            'id',
            'CASCADE',
            null
        )->willReturnSelf();
        $command->expects($this->once())->method('execute')->willReturnCallback(static function () use ($state, $key) {
            $state->keys = [$key];

            return 0;
        });

        $repair->restore(self::DEFINITION);
        $repair->restore(self::DEFINITION);
    }

    public function testOrphanSqlIgnoresNullReferencesAndUsesQuotedPrefixes(): void
    {
        [$repair, $command, , , $db, $state] = $this->fixture();
        $state->commandFactory = function ($sql = null) use ($command, $db) {
            $this->assertStringContainsString('ff_child.`id` IS NOT NULL', $sql);
            $this->assertStringContainsString('NOT EXISTS', $sql);
            $this->assertStringContainsString('`craft_freeform_submissions_contact_1`', $db->quoteSql($sql));
            $this->assertStringContainsString('`craft_freeform_submissions`', $db->quoteSql($sql));

            return $command;
        };

        $repair->inspect(self::DEFINITION);
    }

    public function testOrphanQueryAgainstRealRows(): void
    {
        if (!class_exists(\SQLite3::class)) {
            $this->markTestSkipped('SQLite3 is required for the row-level query test.');
        }

        // phpcs:ignore PHPCompatibility.Extensions.RemovedExtensions.sqliteRemoved -- SQLite3 uses the supported sqlite3 extension, not the removed sqlite extension.
        $sqlite = new \SQLite3(':memory:');
        $sqlite->exec('CREATE TABLE craft_freeform_submissions (id INTEGER PRIMARY KEY)');
        $sqlite->exec('CREATE TABLE craft_freeform_submissions_contact_1 (id INTEGER)');
        $sqlite->exec('INSERT INTO craft_freeform_submissions VALUES (1)');
        $sqlite->exec('INSERT INTO craft_freeform_submissions_contact_1 VALUES (1), (2), (NULL)');
        [$repair, , , , $db, $state] = $this->fixture();
        $state->commandFactory = function ($sql) use ($sqlite, $db) {
            $command = $this->createMock(Command::class);
            $command->method('queryScalar')->willReturn($sqlite->querySingle($db->quoteSql($sql)));

            return $command;
        };

        $this->assertSame(1, $repair->inspect(self::DEFINITION)['orphanCount']);
        $this->assertSame(3, $sqlite->querySingle('SELECT COUNT(*) FROM craft_freeform_submissions_contact_1'));
        $sqlite->close();
    }

    public function testDefinitionsIncludeRulesAndOnlyPrefixedContentTables(): void
    {
        [$repair, $command, , , , $state] = $this->fixture();
        $state->tableNames = [
            'craft_freeform_submissions_contact_1',
            'craft_freeform_submissions__2',
            'craft_freeform_submissions_tracking_parameters',
            'backup_craft_freeform_submissions_contact_1',
            'other_freeform_submissions_contact_1',
        ];
        $command->expects($this->never())->method('execute');
        $definitions = $repair->getDefinitions();
        $sources = array_column($definitions, 1);

        $this->assertContains('{{%freeform_rules_fields}}', $sources);
        $this->assertContains('{{%freeform_rules_integrations}}', $sources);
        $this->assertContains('{{%freeform_survey_preferences}}', $sources);
        $this->assertContains('craft_freeform_submissions_contact_1', $sources);
        $this->assertContains('craft_freeform_submissions__2', $sources);
        $this->assertNotContains('backup_craft_freeform_submissions_contact_1', $sources);
        $this->assertNotContains('other_freeform_submissions_contact_1', $sources);
        $this->assertNotContains('craft_freeform_submissions_tracking_parameters', $sources);
    }

    public function testDifferentPostgresReferenceSchemaIsReported(): void
    {
        $key = $this->key();
        $key->foreignSchemaName = 'other';
        [$repair, , , $tables] = $this->fixture([$key]);
        $tables['craft_freeform_submissions']->schemaName = 'public';

        $this->assertSame('conflict', $repair->inspect(self::DEFINITION)['status']);
    }

    private function fixture(array $keys = [], int $orphans = 0, bool $targetExists = true): array
    {
        $state = (object) ['keys' => $keys, 'orphans' => $orphans, 'commandFactory' => null, 'tableNames' => []];
        $db = $this->getMockBuilder(Connection::class)->onlyMethods(['getSchema', 'createCommand'])->getMock();
        $db->dsn = 'mysql:host=localhost;dbname=test';
        $db->tablePrefix = 'craft_';
        $schema = $this->getMockBuilder(Schema::class)->onlyMethods(['getTableSchema', 'getTableForeignKeys', 'getTableNames', 'refreshTableSchema', 'refresh'])->getMock();
        $schema->db = $db;
        $db->method('getSchema')->willReturn($schema);
        $schema->method('getTableNames')->willReturnCallback(static fn () => $state->tableNames);
        $tables = [];
        foreach (['craft_freeform_submissions_contact_1', 'craft_freeform_submissions'] as $name) {
            $table = new TableSchema();
            $table->name = $table->fullName = $name;
            $table->columns = ['id' => new ColumnSchema(['name' => 'id'])];
            $tables[$name] = $table;
        }

        $schema->method('getTableSchema')->willReturnCallback(static function ($name) use ($tables, $targetExists, $schema) {
            $raw = $schema->getRawTableName($name);
            if (!$targetExists && 'craft_freeform_submissions' === $raw) {
                return null;
            }

            return $tables[$raw] ?? null;
        });
        $schema->method('getTableForeignKeys')->willReturnCallback(static fn () => $state->keys);
        $command = $this->createMock(Command::class);
        $command->method('queryScalar')->willReturnCallback(static fn () => $state->orphans);
        $db->method('createCommand')->willReturnCallback(static fn ($sql = null) => $state->commandFactory ? ($state->commandFactory)($sql) : $command);

        return [new ForeignKeyRepair($db), $command, $schema, $tables, $db, $state];
    }

    private function key(): ForeignKeyConstraint
    {
        return new ForeignKeyConstraint([
            'name' => 'historical_arbitrary_name',
            'columnNames' => ['id'],
            'foreignTableName' => 'craft_freeform_submissions',
            'foreignColumnNames' => ['id'],
            'onDelete' => 'CASCADE',
            'onUpdate' => 'RESTRICT',
        ]);
    }
}
