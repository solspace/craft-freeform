<?php

namespace Solspace\Freeform\Tests\Library\Database;

use craft\db\Connection;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Database\ForeignKeyRepair;
use Solspace\Freeform\Library\Database\OrphanCleanup;
use yii\db\ColumnSchema;
use yii\db\Command;
use yii\db\ForeignKeyConstraint;
use yii\db\mysql\Schema;
use yii\db\QueryBuilder;
use yii\db\TableSchema;

#[CoversClass(OrphanCleanup::class)]
class OrphanCleanupTest extends TestCase
{
    private \SQLite3 $sqlite;
    private int $writes = 0;
    private ?string $failOn = null;

    protected function setUp(): void
    {
        if (!class_exists(\SQLite3::class)) {
            $this->markTestSkipped('SQLite3 is required for the row-level cleanup test.');
        }
        // phpcs:ignore PHPCompatibility.Extensions.RemovedExtensions.sqliteRemoved -- SQLite3 is a supported extension.
        $this->sqlite = new \SQLite3(':memory:');
        $this->sqlite->enableExceptions(true);
    }

    protected function tearDown(): void
    {
        if (isset($this->sqlite)) {
            $this->sqlite->close();
        }
    }

    #[DataProvider('drivers')]
    public function testPreviewAndApplyIncludeDescendantsAndPreserveLiveAndNullableData(string $driver): void
    {
        $this->sqlite->exec('CREATE TABLE craft_elements (id INTEGER PRIMARY KEY)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_forms (id INTEGER PRIMARY KEY)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_submissions (id INTEGER PRIMARY KEY, formId INTEGER)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_submissions_contact_1 (id INTEGER PRIMARY KEY)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_child (id INTEGER PRIMARY KEY, submissionId INTEGER)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_grandchild (id INTEGER PRIMARY KEY, childId INTEGER)');
        $this->sqlite->exec('INSERT INTO craft_elements VALUES (1), (3)');
        $this->sqlite->exec('INSERT INTO craft_freeform_forms VALUES (1)');
        $this->sqlite->exec('INSERT INTO craft_freeform_submissions VALUES (1, 1), (2, 1), (3, 99)');
        $this->sqlite->exec('INSERT INTO craft_freeform_submissions_contact_1 VALUES (1), (2), (3), (4)');
        $this->sqlite->exec('INSERT INTO craft_freeform_child VALUES (1, 1), (2, 2), (3, 3), (4, 99), (5, NULL)');
        $this->sqlite->exec('INSERT INTO craft_freeform_grandchild VALUES (1, 1), (2, 2), (3, 3), (4, 4), (5, 99)');
        $definitions = [
            $this->definition('freeform_child', 'submissionId', 'freeform_submissions'),
            $this->definition('freeform_grandchild', 'childId', 'freeform_child'),
            $this->definition('freeform_submissions', 'id', 'elements'),
            $this->definition('freeform_submissions', 'formId', 'freeform_forms'),
            $this->definition('freeform_submissions_contact_1', 'id', 'freeform_submissions'),
        ];
        $cleanup = $this->fixture($definitions, $driver);
        $preview = $cleanup->run();
        $this->assertSame(12, array_sum(array_column($preview, 'deleted')));
        $this->assertSame(0, $this->writes);
        $this->assertSame(3, $this->sqlite->querySingle('SELECT COUNT(*) FROM craft_freeform_submissions'));
        $this->assertSame($preview, $cleanup->run(true));
        $this->assertSame(1, $this->sqlite->querySingle('SELECT COUNT(*) FROM craft_freeform_submissions'));
        $this->assertSame(1, $this->sqlite->querySingle('SELECT COUNT(*) FROM craft_freeform_submissions_contact_1'));
        $this->assertSame(2, $this->sqlite->querySingle('SELECT COUNT(*) FROM craft_freeform_child'));
        $this->assertSame(2, $this->sqlite->querySingle('SELECT COUNT(*) FROM craft_elements'));
        $this->assertSame(0, array_sum(array_column($cleanup->run(true), 'deleted')));
    }

    #[DataProvider('drivers')]
    public function testSetNullRelationshipsPreserveOwnersAndExcludeRowsToDelete(string $driver): void
    {
        $this->sqlite->exec('CREATE TABLE craft_users (id INTEGER PRIMARY KEY)');
        $this->sqlite->exec('CREATE TABLE craft_sites (id INTEGER PRIMARY KEY)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_forms (id INTEGER PRIMARY KEY, userId INTEGER, siteId INTEGER)');
        $this->sqlite->exec('INSERT INTO craft_users VALUES (1)');
        $this->sqlite->exec('INSERT INTO craft_sites VALUES (1)');
        $this->sqlite->exec('INSERT INTO craft_freeform_forms VALUES (1, 1, 1), (2, 99, 1), (3, NULL, 1), (4, 99, 99)');
        $clear = $this->definition('freeform_forms', 'userId', 'users');
        $clear[5] = 'SET NULL';
        $cleanup = $this->fixture([$clear, $this->definition('freeform_forms', 'siteId', 'sites')], $driver);
        $preview = $cleanup->run();
        $this->assertSame([['table' => 'craft_freeform_forms', 'deleted' => 1, 'cleared' => 1]], $preview);
        $this->assertSame($preview, $cleanup->run(true));
        $this->assertSame(3, $this->sqlite->querySingle('SELECT COUNT(*) FROM craft_freeform_forms'));
        $this->assertNull($this->sqlite->querySingle('SELECT userId FROM craft_freeform_forms WHERE id = 2'));
    }

    public static function drivers(): array
    {
        return [['mysql'], ['pgsql']];
    }

    public function testCompositeReferencesExemptAnyNullComponent(): void
    {
        $this->sqlite->exec('CREATE TABLE craft_parent (id INTEGER PRIMARY KEY, locale INTEGER)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_child (id INTEGER PRIMARY KEY, parentId INTEGER, locale INTEGER)');
        $this->sqlite->exec('INSERT INTO craft_parent VALUES (1, 1)');
        $this->sqlite->exec('INSERT INTO craft_freeform_child VALUES (1, 1, 1), (2, 1, 2), (3, NULL, 99), (4, 99, NULL)');
        $definition = $this->definition('freeform_child', 'parentId', 'parent');
        $definition[2] = ['parentId', 'locale'];
        $definition[4] = ['id', 'locale'];
        $cleanup = $this->fixture([$definition]);
        $this->assertSame(1, $cleanup->run(true)[0]['deleted']);
        $this->assertSame(3, $this->sqlite->querySingle('SELECT COUNT(*) FROM craft_freeform_child'));
    }

    public function testFailureRollsBackEarlierDeletes(): void
    {
        $this->sqlite->exec('CREATE TABLE craft_parent (id INTEGER PRIMARY KEY)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_child (id INTEGER PRIMARY KEY, parentId INTEGER)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_grandchild (id INTEGER PRIMARY KEY, childId INTEGER)');
        $this->sqlite->exec('INSERT INTO craft_freeform_child VALUES (1, 99)');
        $this->sqlite->exec('INSERT INTO craft_freeform_grandchild VALUES (1, 1)');
        $cleanup = $this->fixture([
            $this->definition('freeform_child', 'parentId', 'parent'),
            $this->definition('freeform_grandchild', 'childId', 'freeform_child'),
        ]);
        $this->failOn = 'DELETE FROM `craft_freeform_child`';

        try {
            $cleanup->run(true);
            $this->fail('The cleanup should fail.');
        } catch (\RuntimeException $e) {
            $this->assertSame('Simulated write failure', $e->getMessage());
        }
        $this->assertSame(2, $this->writes);
        $this->assertSame(1, $this->sqlite->querySingle('SELECT COUNT(*) FROM craft_freeform_grandchild'));
    }

    public function testSurvivingCascadesAndSetNullReferencesMatchThePreview(): void
    {
        $this->sqlite->exec('CREATE TABLE craft_parent (id INTEGER PRIMARY KEY)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_child (id INTEGER PRIMARY KEY, parentId INTEGER)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_grandchild (id INTEGER PRIMARY KEY, childId INTEGER REFERENCES craft_freeform_child(id) ON DELETE CASCADE)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_owner (id INTEGER PRIMARY KEY, childId INTEGER REFERENCES craft_freeform_child(id) ON DELETE SET NULL)');
        $this->sqlite->exec('INSERT INTO craft_freeform_child VALUES (1, 99)');
        $this->sqlite->exec('INSERT INTO craft_freeform_grandchild VALUES (1, 1)');
        $this->sqlite->exec('INSERT INTO craft_freeform_owner VALUES (1, 1)');
        $this->sqlite->exec('PRAGMA foreign_keys = ON');
        $clear = $this->definition('freeform_owner', 'childId', 'freeform_child');
        $clear[5] = 'SET NULL';
        $cleanup = $this->fixture([
            $this->definition('freeform_child', 'parentId', 'parent'),
            $this->definition('freeform_grandchild', 'childId', 'freeform_child'),
            $clear,
        ]);
        $preview = $cleanup->run();
        $this->assertSame(2, array_sum(array_column($preview, 'deleted')));
        $this->assertSame(1, array_sum(array_column($preview, 'cleared')));
        $this->assertSame($preview, $cleanup->run(true));
        $this->assertSame(1, $this->sqlite->querySingle('SELECT COUNT(*) FROM craft_freeform_owner'));
        $this->assertNull($this->sqlite->querySingle('SELECT childId FROM craft_freeform_owner'));
    }

    public function testCyclesAreRejectedBeforeWriting(): void
    {
        $this->sqlite->exec('CREATE TABLE craft_freeform_a (id INTEGER PRIMARY KEY, bId INTEGER)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_b (id INTEGER PRIMARY KEY, aId INTEGER)');
        $cleanup = $this->fixture([
            $this->definition('freeform_a', 'bId', 'freeform_b'),
            $this->definition('freeform_b', 'aId', 'freeform_a'),
        ]);

        try {
            $cleanup->run(true);
            $this->fail('Cyclic relationships should require review.');
        } catch (\RuntimeException $e) {
            $this->assertStringContainsString('Cyclic', $e->getMessage());
        }
        $this->assertSame(0, $this->writes);
    }

    public function testMissingSchemaPreventsAllWrites(): void
    {
        $this->sqlite->exec('CREATE TABLE craft_parent (id INTEGER PRIMARY KEY)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_child (id INTEGER PRIMARY KEY, parentId INTEGER)');
        $this->sqlite->exec('INSERT INTO craft_freeform_child VALUES (1, 99)');
        $cleanup = $this->fixture([
            $this->definition('freeform_child', 'parentId', 'parent'),
            $this->definition('missing_child', 'parentId', 'parent'),
        ]);

        try {
            $cleanup->run(true);
            $this->fail('The cleanup should reject the missing table.');
        } catch (\RuntimeException $e) {
            $this->assertStringContainsString('required table is missing', $e->getMessage());
        }
        $this->assertSame(0, $this->writes);
    }

    public function testConflictingConstraintPreventsAllWrites(): void
    {
        $this->sqlite->exec('CREATE TABLE craft_parent (id INTEGER PRIMARY KEY)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_child (id INTEGER PRIMARY KEY, parentId INTEGER)');
        $cleanup = $this->fixture([$this->definition('freeform_child', 'parentId', 'parent')], keys: [new ForeignKeyConstraint([
            'name' => 'custom_fk', 'columnNames' => ['parentId'], 'foreignTableName' => 'craft_parent', 'foreignColumnNames' => ['id'], 'onDelete' => 'RESTRICT',
        ])]);
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('differs from the expected relationship');
        $cleanup->run(true);
    }

    public function testAllShippedRelationshipsCanBePlanned(): void
    {
        $results = $this->fixture(null)->run();
        $this->assertGreaterThan(30, \count($results));
        $this->assertSame(0, array_sum(array_column($results, 'deleted')));
        $this->assertSame(0, $this->writes);
    }

    private function definition(string $table, string $column, string $parent): array
    {
        return [null, '{{%'.$table.'}}', $column, '{{%'.$parent.'}}', 'id', 'CASCADE', null];
    }

    private function fixture(?array $definitions, string $driver = 'mysql', array $keys = []): OrphanCleanup
    {
        $db = $this->getMockBuilder(Connection::class)->onlyMethods(['getSchema', 'createCommand', 'transaction'])->getMock();
        $db->tablePrefix = 'craft_';
        $db->dsn = $driver.':host=localhost;dbname=test';
        $schemaClass = 'pgsql' === $driver ? \yii\db\pgsql\Schema::class : Schema::class;
        $schema = $this->getMockBuilder($schemaClass)->onlyMethods(['getTableSchema', 'getTableForeignKeys', 'getTableNames', 'createQueryBuilder', 'refresh'])->getMock();
        $schema->db = $db;
        $db->method('getSchema')->willReturn($schema);
        $schema->method('createQueryBuilder')->willReturn(new QueryBuilder($db));
        $schema->method('getTableNames')->willReturn([]);
        if (null === $definitions) {
            $definitions = (new ForeignKeyRepair($db))->getDefinitions();
            $tables = [];
            foreach ($definitions as $definition) {
                foreach ([1 => 2, 3 => 4] as $tableIndex => $columnIndex) {
                    $table = $schema->getRawTableName($definition[$tableIndex]);
                    $tables[$table] = array_unique(array_merge($tables[$table] ?? ['id'], (array) $definition[$columnIndex]));
                }
            }
            foreach ($tables as $table => $columns) {
                $this->sqlite->exec('CREATE TABLE '.$db->quoteTableName($table).' ('.implode(', ', array_map(static fn ($column) => $db->quoteColumnName($column).' INTEGER', $columns)).')');
            }
        }
        $schema->method('getTableForeignKeys')->willReturn($keys);
        $schema->method('getTableSchema')->willReturnCallback(function ($name) use ($schema) {
            $name = $schema->getRawTableName($name);
            $columns = $this->sqlite->query('PRAGMA table_info('.$schema->quoteTableName($name).')');
            $table = new TableSchema(['name' => $name, 'fullName' => $name]);
            while ($column = $columns->fetchArray(\SQLITE3_ASSOC)) {
                $table->columns[$column['name']] = new ColumnSchema(['name' => $column['name']]);
            }

            return $table->columns ? $table : null;
        });
        $db->method('createCommand')->willReturnCallback(function ($sql = null, $params = []) use ($db) {
            $command = $this->getMockBuilder(Command::class)->setConstructorArgs([['db' => $db, 'sql' => $sql]])->onlyMethods(['execute', 'queryScalar'])->getMock();
            $command->bindValues($params);
            $execute = function () use ($command, $db) {
                $statement = $this->sqlite->prepare($db->quoteSql($command->getSql()));
                foreach ($command->params as $name => $value) {
                    $statement->bindValue($name, $value, null === $value ? \SQLITE3_NULL : \SQLITE3_INTEGER);
                }

                return $statement->execute();
            };
            $command->method('queryScalar')->willReturnCallback(static fn () => $execute()->fetchArray(\SQLITE3_NUM)[0]);
            $command->method('execute')->willReturnCallback(function () use ($execute, $command) {
                ++$this->writes;
                if ($this->failOn && str_starts_with($command->getSql(), $this->failOn)) {
                    throw new \RuntimeException('Simulated write failure');
                }
                $execute();

                return $this->sqlite->changes();
            });

            return $command;
        });
        $db->method('transaction')->willReturnCallback(function ($callback) {
            $this->sqlite->exec('BEGIN');

            try {
                $result = $callback();
                $this->sqlite->exec('COMMIT');

                return $result;
            } catch (\Throwable $e) {
                $this->sqlite->exec('ROLLBACK');

                throw $e;
            }
        });
        $repair = $this->getMockBuilder(ForeignKeyRepair::class)->setConstructorArgs([$db])->onlyMethods(['getDefinitions'])->getMock();
        $repair->method('getDefinitions')->willReturn($definitions);
        $cleanup = $this->getMockBuilder(OrphanCleanup::class)->setConstructorArgs([$db])->onlyMethods(['createRepair'])->getMock();
        $cleanup->method('createRepair')->willReturn($repair);

        return $cleanup;
    }
}
