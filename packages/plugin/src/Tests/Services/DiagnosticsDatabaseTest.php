<?php

namespace Solspace\Freeform\Tests\Services;

use craft\db\Connection;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Database\DatabaseIntegrity;
use Solspace\Freeform\Library\Database\ForeignKeyRepair;
use Solspace\Freeform\Services\DiagnosticsService;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;
use yii\db\ColumnSchema;
use yii\db\Command;
use yii\db\ForeignKeyConstraint;
use yii\db\IndexConstraint;
use yii\db\mysql\Schema;
use yii\db\TableSchema;

#[CoversClass(DiagnosticsService::class)]
class DiagnosticsDatabaseTest extends TestCase
{
    private mixed $previousApp;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
    }

    public function testHealthyMetadataPassesWithoutSubmissionQueries(): void
    {
        $items = $this->fixture()->getDatabaseChecks();
        $item = $items[0];
        $this->assertSame([], $item->getWarnings());
        $this->assertStringContainsString('All expected keys present', (string) $item->getMarkup());
        $this->assertSame([], $items[1]->getWarnings());
        $this->assertStringContainsString('All expected tables, columns, and indexes present', (string) $items[1]->getMarkup());
    }

    public function testMissingKeyRendersWarningAndConsoleInstructions(): void
    {
        $item = $this->fixture(true)->getDatabaseChecks()[0];
        $this->assertCount(1, $item->getWarnings());
        $this->assertStringContainsString('Requires attention', (string) $item->getMarkup());
        $message = (string) $item->getWarnings()[0]->getMessage();
        $this->assertStringContainsString('repair-foreign-keys --dry-run=1', $message);
        $this->assertStringContainsString('craft_freeform_submissions_contact_1', $message);
        $this->assertStringContainsString('1 expected database relationships', $message);
    }

    public function testDatabaseWarningTranslatesSentencesAndCountParameters(): void
    {
        $item = $this->fixture(true, [
            '{count} expected database relationships require attention. Missing or incorrect foreign keys can prevent related submission data from being deleted.' => '{count} relations nécessitent une intervention.',
            'The key is missing. Run the console utility to check for orphaned rows before restoring it.' => 'La clé est manquante.',
            'This check examines database structure only; use the submission scan below or the console utility to check orphaned rows.' => 'Cette vérification examine uniquement la structure.',
        ])->getDatabaseChecks()[0];

        $message = (string) $item->getWarnings()[0]->getMessage();
        $this->assertStringContainsString('1 relations nécessitent une intervention.', $message);
        $this->assertStringContainsString('La clé est manquante.', $message);
        $this->assertStringContainsString('Cette vérification examine uniquement la structure.', $message);
        $this->assertStringNotContainsString('{count}', $message);
        $this->assertStringNotContainsString('{command}', $message);
    }

    private function fixture(bool $missingContentKey = false, array $translations = []): DiagnosticsService
    {
        $db = $this->getMockBuilder(Connection::class)->onlyMethods(['getSchema', 'createCommand'])->getMock();
        $db->tablePrefix = 'craft_';
        $db->dsn = 'mysql:host=localhost;dbname=test';
        $command = $this->createMock(Command::class);
        $command->method('queryColumn')->willReturn([1]);
        $command->expects($this->never())->method('execute');
        $db->expects($this->once())->method('createCommand')->with('SELECT [[id]] FROM {{%freeform_forms}}')->willReturn($command);
        $schema = $this->getMockBuilder(Schema::class)->onlyMethods(['getTableSchema', 'getTableForeignKeys', 'getTableIndexes', 'getTableNames', 'refresh'])->getMock();
        $schema->db = $db;
        $db->method('getSchema')->willReturn($schema);
        $schema->method('getTableNames')->willReturn(['craft_freeform_submissions_contact_1']);

        $tables = $keys = $indexes = [];
        foreach ((new DatabaseIntegrity($db))->getDefinitions() as $definition) {
            $name = $schema->getRawTableName($definition['table']);
            $tables[$name] = new TableSchema(['name' => $name, 'fullName' => $name, 'primaryKey' => ['id']]);
            foreach ($definition['columns'] as $column) {
                $tables[$name]->columns[$column] = new ColumnSchema(['name' => $column]);
            }
            foreach ($definition['indexes'] as $index) {
                $indexes[$name][] = new IndexConstraint(['columnNames' => $index['columns'], 'isUnique' => $index['unique'], 'isPrimary' => $index['primary']]);
            }
        }
        foreach ((new ForeignKeyRepair($db))->getDefinitions() as $definition) {
            [, $source, $columns, $target, $referenceColumns, $onDelete, $onUpdate] = $definition;
            $source = $schema->getRawTableName($source);
            $target = $schema->getRawTableName($target);
            foreach ([$source => $columns, $target => $referenceColumns] as $name => $tableColumns) {
                $tables[$name] ??= new TableSchema(['name' => $name, 'fullName' => $name]);
                foreach ((array) $tableColumns as $column) {
                    $tables[$name]->columns[$column] = new ColumnSchema(['name' => $column]);
                }
            }
            if ($missingContentKey && 'craft_freeform_submissions_contact_1' === $source) {
                continue;
            }
            $keys[$source][] = new ForeignKeyConstraint([
                'columnNames' => (array) $columns,
                'foreignTableName' => $target,
                'foreignColumnNames' => (array) $referenceColumns,
                'onDelete' => $onDelete,
                'onUpdate' => $onUpdate,
            ]);
        }
        $schema->method('getTableSchema')->willReturnCallback(static fn ($name) => $tables[$schema->getRawTableName($name)] ?? null);
        $schema->method('getTableForeignKeys')->willReturnCallback(static fn ($name) => $keys[$schema->getRawTableName($name)] ?? []);
        $schema->method('getTableIndexes')->willReturnCallback(static fn ($name) => $indexes[$schema->getRawTableName($name)] ?? []);

        $twig = new Environment(new ArrayLoader(), ['autoescape' => 'html']);
        $twig->addFilter(new TwigFilter('t', static function ($message, $category = null, array $params = []) use ($translations) {
            $replacements = [];
            foreach ($params as $key => $value) {
                $replacements['{'.$key.'}'] = $value;
            }

            return strtr($translations[$message] ?? $message, $replacements);
        }));
        $view = new class($twig) {
            public function __construct(private Environment $twig) {}

            public function renderString($template, $variables): string
            {
                return $this->twig->createTemplate($template)->render($variables);
            }
        };
        \Craft::$app = new class($db, $view) {
            public function __construct(private Connection $db, public object $view) {}

            public function getDb(): Connection
            {
                return $this->db;
            }
        };

        return (new \ReflectionClass(DiagnosticsService::class))->newInstanceWithoutConstructor();
    }
}
