<?php

namespace Solspace\Freeform\Tests\Library\Database;

use craft\db\Connection;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Database\IntegrityScan;
use yii\db\ColumnSchema;
use yii\db\Command;
use yii\db\IndexConstraint;
use yii\db\mysql\Schema;
use yii\db\TableSchema;

#[CoversClass(IntegrityScan::class)]
class IntegrityScanTest extends TestCase
{
    private \SQLite3 $sqlite;
    private IntegrityScan $scan;

    protected function setUp(): void
    {
        if (!class_exists(\SQLite3::class)) {
            $this->markTestSkipped('SQLite3 is required for the row-level integrity test.');
        }
        // phpcs:ignore PHPCompatibility.Extensions.RemovedExtensions.sqliteRemoved -- SQLite3 uses the supported sqlite3 extension, not the removed sqlite extension.
        $this->sqlite = new \SQLite3(':memory:');
        $db = $this->getMockBuilder(Connection::class)->onlyMethods(['getSchema', 'createCommand'])->getMock();
        $db->tablePrefix = 'craft_';
        $schema = new Schema(['db' => $db]);
        $db->method('getSchema')->willReturn($schema);
        $db->method('createCommand')->willReturnCallback(function ($sql, $params = []) use ($db) {
            $statement = $this->sqlite->prepare($db->quoteSql($sql));
            foreach ($params as $name => $value) {
                $statement->bindValue($name, $value, \SQLITE3_INTEGER);
            }
            $command = $this->createMock(Command::class);
            $command->expects($this->never())->method('execute');
            $command->method('queryScalar')->willReturnCallback(static fn () => $statement->execute()->fetchArray(\SQLITE3_NUM)[0]);
            $command->method('queryColumn')->willReturnCallback(static function () use ($statement) {
                $result = $statement->execute();
                $ids = [];
                while ($row = $result->fetchArray(\SQLITE3_NUM)) {
                    $ids[] = $row[0];
                }

                return $ids;
            });

            return $command;
        });
        $this->scan = new IntegrityScan($db);
    }

    protected function tearDown(): void
    {
        if (isset($this->sqlite)) {
            $this->sqlite->close();
        }
    }

    public function testMultipleMissingParentsCountEachRowOnceAndIgnoreNulls(): void
    {
        $this->sqlite->exec('CREATE TABLE craft_child (id INTEGER PRIMARY KEY, aId INTEGER, bId INTEGER)');
        $this->sqlite->exec('CREATE TABLE craft_parent (id INTEGER PRIMARY KEY)');
        $this->sqlite->exec('INSERT INTO craft_parent VALUES (1)');
        $this->sqlite->exec('INSERT INTO craft_child VALUES (1, 1, 1), (2, 99, 1), (3, 99, 99), (4, NULL, NULL)');
        $task = ['type' => 'orphans', 'table' => '{{%child}}', 'error' => null, 'definitions' => [
            [null, '{{%child}}', 'aId', '{{%parent}}', 'id', null, null],
            [null, '{{%child}}', 'bId', '{{%parent}}', 'id', null, null],
        ]];
        $result = $this->scan->scanTask($task);
        $this->assertSame(4, $result['scanned']);
        $this->assertSame(2, $result['affected']);
        $this->assertTrue($result['complete']);
        $this->assertSame(4, $this->sqlite->querySingle('SELECT COUNT(*) FROM craft_child'));
    }

    public function testRetainedSubmissionChildrenWithMissingRootParentsAreCounted(): void
    {
        $this->sqlite->exec('CREATE TABLE craft_child (id INTEGER PRIMARY KEY, submissionId INTEGER)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_submissions (id INTEGER PRIMARY KEY, formId INTEGER)');
        $this->sqlite->exec('CREATE TABLE craft_elements (id INTEGER PRIMARY KEY)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_forms (id INTEGER PRIMARY KEY)');
        $this->sqlite->exec('INSERT INTO craft_freeform_forms VALUES (1)');
        $this->sqlite->exec('INSERT INTO craft_elements VALUES (1), (3)');
        $this->sqlite->exec('INSERT INTO craft_freeform_submissions VALUES (1, 1), (2, 1), (3, 99)');
        $this->sqlite->exec('INSERT INTO craft_child VALUES (1, 1), (2, 2), (3, 3), (4, 99)');
        $task = ['type' => 'orphans', 'table' => '{{%child}}', 'error' => null, 'definitions' => [[null, '{{%child}}', 'submissionId', '{{%freeform_submissions}}', 'id', null, null]]];
        $this->assertSame(3, $this->scan->scanTask($task)['affected']);
    }

    public function testDuplicateCountsIncludeWholeGroupsAndExemptNullableValues(): void
    {
        $this->sqlite->exec('CREATE TABLE craft_child (id INTEGER, a TEXT, b INTEGER)');
        $this->sqlite->exec("INSERT INTO craft_child VALUES (1, 'x', 1), (2, 'x', 1), (3, 'x', 1), (4, 'x', 2), (5, NULL, 1), (6, NULL, 1)");
        $task = ['type' => 'duplicates', 'table' => '{{%child}}', 'columns' => ['a', 'b'], 'error' => null];
        $this->assertSame(3, $this->scan->scanTask($task)['affected']);
        $this->assertSame(6, $this->sqlite->querySingle('SELECT COUNT(*) FROM craft_child'));
    }

    public function testMissingSchemaIsExplicitlySkipped(): void
    {
        $result = $this->scan->scanTask(['type' => 'orphans', 'table' => '{{%missing}}', 'error' => 'Missing table']);
        $this->assertSame('Missing table', $result['error']);
        $this->assertTrue($result['complete']);
    }

    public function testRelatedOrphansAreBatchedAcrossSparseIds(): void
    {
        $this->sqlite->exec('CREATE TABLE craft_child (id INTEGER PRIMARY KEY, parentId INTEGER)');
        $this->sqlite->exec('CREATE TABLE craft_parent (id INTEGER PRIMARY KEY)');
        $this->sqlite->exec('BEGIN');
        for ($id = 1; $id <= 1001; ++$id) {
            $this->sqlite->exec('INSERT INTO craft_child VALUES ('.($id * 10).', 99)');
        }
        $this->sqlite->exec('COMMIT');
        $task = ['type' => 'orphans', 'table' => '{{%child}}', 'error' => null, 'definitions' => [[null, '{{%child}}', 'parentId', '{{%parent}}', 'id', null, null]]];
        $first = $this->scan->scanTask($task);
        $this->assertSame(1000, $first['affected']);
        $this->assertFalse($first['complete']);
        $this->sqlite->exec('INSERT INTO craft_child VALUES (20000, 99)');
        $last = $this->scan->scanTask($task, $first['cursor'], $first['maxId']);
        $this->assertSame(1, $last['affected']);
        $this->assertTrue($last['complete']);
    }

    public function testTaskDiscoveryUsesMetadataAndOnlyChecksUnprotectedUniqueValues(): void
    {
        $db = $this->getMockBuilder(Connection::class)->onlyMethods(['getSchema', 'createCommand'])->getMock();
        $db->dsn = 'mysql:host=localhost;dbname=test';
        $db->tablePrefix = 'craft_';
        $db->expects($this->never())->method('createCommand');
        $schema = $this->getMockBuilder(Schema::class)->onlyMethods(['refresh', 'getTableSchema', 'getTableIndexes', 'getTableNames'])->getMock();
        $schema->db = $db;
        $db->method('getSchema')->willReturn($schema);
        $schema->method('getTableNames')->willReturn(['craft_freeform_submissions_contact_1']);
        $tables = [];
        foreach (['craft_freeform_submissions_contact_1' => ['id'], 'craft_freeform_submissions' => ['id', 'formId'], 'craft_freeform_forms' => ['id'], 'craft_elements' => ['id'], 'craft_freeform_statuses' => ['id', 'handle']] as $name => $columns) {
            $tables[$name] = new TableSchema(['name' => $name, 'primaryKey' => ['id']]);
            foreach ($columns as $column) {
                $tables[$name]->columns[$column] = new ColumnSchema(['name' => $column]);
            }
        }
        $schema->method('getTableSchema')->willReturnCallback(static fn ($name) => $tables[$schema->getRawTableName($name)] ?? null);
        $schema->method('getTableIndexes')->willReturn([new IndexConstraint(['columnNames' => ['id'], 'isUnique' => true, 'isPrimary' => true])]);
        $tasks = (new IntegrityScan($db))->getTasks();
        $duplicates = array_values(array_filter($tasks, static fn ($task) => 'duplicates' === $task['type']));
        $this->assertCount(1, $duplicates);
        $this->assertSame(['handle'], $duplicates[0]['columns']);
        $content = array_values(array_filter($tasks, static fn ($task) => 'craft_freeform_submissions_contact_1' === $task['table']));
        $this->assertCount(1, $content);
        $this->assertNull($content[0]['error']);
    }
}
