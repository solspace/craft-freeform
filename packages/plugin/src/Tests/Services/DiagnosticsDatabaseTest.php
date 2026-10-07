<?php

namespace Solspace\Freeform\Tests\Services;

use craft\db\Connection;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Database\ForeignKeyRepair;
use Solspace\Freeform\Services\DiagnosticsService;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;
use yii\db\ColumnSchema;
use yii\db\ForeignKeyConstraint;
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
        $item = $this->fixture()->getDatabaseChecks()[0];
        $this->assertSame([], $item->getWarnings());
        $this->assertStringContainsString('All expected keys present', (string) $item->getMarkup());
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

    private function fixture(bool $missingContentKey = false): DiagnosticsService
    {
        $db = $this->getMockBuilder(Connection::class)->onlyMethods(['getSchema', 'createCommand'])->getMock();
        $db->tablePrefix = 'craft_';
        $db->expects($this->never())->method('createCommand');
        $schema = $this->getMockBuilder(Schema::class)->onlyMethods(['getTableSchema', 'getTableForeignKeys', 'getTableNames', 'refresh'])->getMock();
        $schema->db = $db;
        $db->method('getSchema')->willReturn($schema);
        $schema->method('getTableNames')->willReturn(['craft_freeform_submissions_contact_1']);

        $tables = $keys = [];
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

        $twig = new Environment(new ArrayLoader(), ['autoescape' => 'html']);
        $twig->addFilter(new TwigFilter('t', static fn ($message) => $message));
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
