<?php

namespace Solspace\Freeform\Tests\Library\Database;

use craft\db\Connection;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Database\DatabaseIntegrity;
use Solspace\Freeform\migrations\Install;
use yii\db\ColumnSchema;
use yii\db\Command;
use yii\db\IndexConstraint;
use yii\db\mysql\Schema;
use yii\db\TableSchema;

#[CoversClass(DatabaseIntegrity::class)]
class DatabaseIntegrityTest extends TestCase
{
    private const DEFINITION = ['table' => '{{%freeform_forms}}', 'columns' => ['id', 'handle'], 'indexes' => [['columns' => ['handle'], 'unique' => true, 'primary' => false]]];

    public function testMissingTableAndColumnsAreReportedWithoutRowQueries(): void
    {
        [$integrity, $table, $db] = $this->fixture();
        $db->expects($this->never())->method('createCommand');
        $missing = self::DEFINITION;
        $missing['table'] = '{{%missing}}';
        $this->assertStringContainsString('required table is missing', $integrity->inspectTable($missing)[0]['message']);
        unset($table->columns['handle']);
        $issues = $integrity->inspectTable(self::DEFINITION);
        $this->assertCount(1, $issues);
        $this->assertStringContainsString('Required columns are missing: handle', $issues[0]['message']);
    }

    public function testIndexNamesAndUniqueColumnOrderDoNotMatter(): void
    {
        [$integrity] = $this->fixture([new IndexConstraint(['name' => 'old_name', 'columnNames' => ['handle', 'id'], 'isUnique' => true, 'isPrimary' => false])]);
        $this->assertTrue($integrity->hasIndex('{{%freeform_forms}}', ['columns' => ['id', 'handle'], 'unique' => true, 'primary' => false]));
        $this->assertFalse($integrity->hasIndex('{{%freeform_forms}}', ['columns' => ['handle'], 'unique' => true, 'primary' => false]));
        $this->assertTrue($integrity->hasIndex('{{%freeform_forms}}', ['columns' => ['handle'], 'unique' => false, 'primary' => false]));
        $this->assertFalse($integrity->hasIndex('{{%freeform_forms}}', ['columns' => ['id'], 'unique' => false, 'primary' => false]));
    }

    public function testMissingUniqueConstraintAndPrimaryKeyAreReported(): void
    {
        [$integrity] = $this->fixture([new IndexConstraint(['columnNames' => ['id'], 'isUnique' => true, 'isPrimary' => false])]);
        $this->assertStringContainsString('unique constraint is missing', $integrity->inspectTable(self::DEFINITION)[0]['message']);
        $this->assertFalse($integrity->hasIndex('{{%freeform_forms}}', ['columns' => ['id'], 'unique' => true, 'primary' => true]));
    }

    public function testNotificationLogLookupAcceptsItsHistoricalFreshInstallVariantOnly(): void
    {
        [$integrity] = $this->fixture([new IndexConstraint(['columnNames' => ['type', 'identifier', 'name', 'dateCreated'], 'isUnique' => false, 'isPrimary' => false])]);
        $expected = ['columns' => ['type', 'identifier', 'name', 'digestDate'], 'unique' => false, 'primary' => false];
        $this->assertTrue($integrity->hasIndex('{{%freeform_notification_log}}', $expected));
        $this->assertFalse($integrity->hasIndex('{{%other}}', $expected));
        $expected['unique'] = true;
        $this->assertFalse($integrity->hasIndex('{{%freeform_notification_log}}', $expected));
    }

    public function testExpectedIndexesRespectLaterUpgradeMigrations(): void
    {
        [$integrity, , $db, $schema] = $this->fixture();
        $definitions = (new Install(['db' => $db]))->getTableDefinitions();
        $byTable = array_column($definitions, null, 'table');
        $notificationIndexes = $byTable['{{%freeform_notification_templates}}']['indexes'];
        $this->assertSame([], array_values(array_filter($notificationIndexes, static fn ($index) => $index['unique'] && !$index['primary'])));
        $idempotency = array_values(array_filter($byTable['{{%freeform_submissions}}']['indexes'], static fn ($index) => ['idempotencyKey', 'formId', 'dateCreated'] === $index['columns']));
        $this->assertCount(1, $idempotency);
        $this->assertFalse($idempotency[0]['unique']);
        $this->assertContains(['columns' => ['type', 'identifier', 'name', 'digestDate'], 'unique' => false, 'primary' => false], $byTable['{{%freeform_notification_log}}']['indexes']);
    }

    public function testPerFormStorageCheckReadsOnlyFormIds(): void
    {
        [$integrity, , $db] = $this->fixture();
        $command = $this->createMock(Command::class);
        $command->method('queryColumn')->willReturn([1, 2]);
        $command->expects($this->never())->method('execute');
        $db->expects($this->once())->method('createCommand')->with('SELECT [[id]] FROM {{%freeform_forms}}')->willReturn($command);
        $issues = $integrity->inspect();
        $this->assertSame('Form #2', end($issues)['relationship']);
        $this->assertStringContainsString('per-form submission table is missing', end($issues)['message']);
    }

    private function fixture(array $indexes = []): array
    {
        $db = $this->getMockBuilder(Connection::class)->onlyMethods(['getSchema', 'createCommand'])->getMock();
        $db->tablePrefix = 'craft_';
        $db->dsn = 'mysql:host=localhost;dbname=test';
        $schema = $this->getMockBuilder(Schema::class)->onlyMethods(['getTableSchema', 'getTableIndexes', 'getTableNames', 'refresh'])->getMock();
        $schema->db = $db;
        $db->method('getSchema')->willReturn($schema);
        $schema->method('getTableIndexes')->willReturn($indexes);
        $schema->method('getTableNames')->willReturn(['craft_freeform_submissions_contact_1', 'backup_craft_freeform_submissions_contact_2']);
        $table = new TableSchema(['name' => 'craft_freeform_forms', 'columns' => ['id' => new ColumnSchema(), 'handle' => new ColumnSchema()]]);
        $schema->method('getTableSchema')->willReturnCallback(static fn ($name) => $schema->getRawTableName($name) === 'craft_freeform_forms' ? $table : null);
        $integrity = $this->getMockBuilder(DatabaseIntegrity::class)->setConstructorArgs([$db])->onlyMethods(['getDefinitions'])->getMock();
        $integrity->method('getDefinitions')->willReturn([self::DEFINITION]);

        return [$integrity, $table, $db, $schema];
    }
}
