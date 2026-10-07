<?php

namespace Solspace\Freeform\Tests\Library\Database;

use craft\db\Connection;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Database\OrphanedSubmissionScanner;
use yii\db\Command;
use yii\db\mysql\Schema;

#[CoversClass(OrphanedSubmissionScanner::class)]
class OrphanedSubmissionScannerTest extends TestCase
{
    private \SQLite3 $sqlite;
    private OrphanedSubmissionScanner $scanner;

    protected function setUp(): void
    {
        if (!class_exists(\SQLite3::class)) {
            $this->markTestSkipped('SQLite3 is required for the row-level scan test.');
        }

        // phpcs:ignore PHPCompatibility.Extensions.RemovedExtensions.sqliteRemoved -- SQLite3 uses the supported sqlite3 extension, not the removed sqlite extension.
        $this->sqlite = new \SQLite3(':memory:');
        $this->sqlite->exec('CREATE TABLE craft_freeform_submissions (id INTEGER PRIMARY KEY, formId INTEGER)');
        $this->sqlite->exec('CREATE TABLE craft_elements (id INTEGER PRIMARY KEY, dateDeleted TEXT)');
        $this->sqlite->exec('CREATE TABLE craft_freeform_forms (id INTEGER PRIMARY KEY)');
        $this->sqlite->exec('INSERT INTO craft_freeform_forms VALUES (1)');

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
            $command->method('queryScalar')->willReturnCallback(static function () use ($statement) {
                return $statement->execute()->fetchArray(\SQLITE3_NUM)[0];
            });
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
        $this->scanner = new OrphanedSubmissionScanner($db);
    }

    protected function tearDown(): void
    {
        if (isset($this->sqlite)) {
            $this->sqlite->close();
        }
    }

    public function testCountsEachSubmissionOnceAndKeepsSoftDeletedElements(): void
    {
        $this->sqlite->exec('INSERT INTO craft_freeform_submissions VALUES (1, 1), (2, 1), (3, 99), (4, 99), (5, 1)');
        $this->sqlite->exec("INSERT INTO craft_elements VALUES (1, NULL), (3, NULL), (5, '2026-10-01')");

        $result = $this->scanner->scan();
        $this->assertSame(5, $result['scanned']);
        $this->assertSame(3, $result['affected']);
        $this->assertTrue($result['complete']);
        $this->assertSame(5, $this->sqlite->querySingle('SELECT COUNT(*) FROM craft_freeform_submissions'));
    }

    public function testBatchesSkipIdGapsAndExcludeNewSubmissions(): void
    {
        $this->sqlite->exec('BEGIN');
        for ($id = 1; $id <= 1001; ++$id) {
            $this->sqlite->exec('INSERT INTO craft_freeform_submissions VALUES ('.($id * 10).', 1)');
        }
        $this->sqlite->exec('COMMIT');

        $first = $this->scanner->scan();
        $this->assertSame(1000, $first['scanned']);
        $this->assertSame(1000, $first['affected']);
        $this->assertFalse($first['complete']);
        $this->sqlite->exec('INSERT INTO craft_freeform_submissions VALUES (20000, 1)');
        $last = $this->scanner->scan($first['cursor'], $first['maxId']);
        $this->assertSame(1, $last['scanned']);
        $this->assertSame(1, $last['affected']);
        $this->assertTrue($last['complete']);
        $this->assertSame(10010, $last['maxId']);
    }

    public function testEmptyDatabaseCompletesWithoutAffectedRows(): void
    {
        $this->assertSame(['cursor' => 0, 'maxId' => 0, 'scanned' => 0, 'affected' => 0, 'complete' => true], $this->scanner->scan());
    }

    public function testNegativeCursorIsRejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->scanner->scan(-1);
    }
}
