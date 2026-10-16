<?php

namespace Solspace\Freeform\Tests\Library\Database;

use craft\db\Command;
use craft\db\Connection;
use Illuminate\Config\Repository;
use Illuminate\Container\Container;
use Illuminate\Database\DatabaseServiceProvider;
use Illuminate\Events\Dispatcher;
use Illuminate\Support\Facades\Facade;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Commands\DatabaseController;
use Solspace\Freeform\Library\Database\ForeignKeyRepair;
use Solspace\Freeform\Library\Database\OrphanCleanup;
use yii\console\Application;
use yii\console\ExitCode;

/**
 * Set FREEFORM_TEST_MYSQL_DSN or FREEFORM_TEST_PGSQL_DSN to run live tests;
 * matching _USER and _PASSWORD variables supply the credentials.
 * Creates and removes only tables with a random test prefix.
 */
#[Group('database-integration')]
#[CoversClass(OrphanCleanup::class)]
#[CoversClass(DatabaseController::class)]
class OrphanCleanupIntegrationTest extends TestCase
{
    private Connection $db;
    private array $tables = [];
    private array $functions = [];
    private $previousCraftApp;
    private $previousYiiApp;
    private Container $previousLaravelContainer;
    private $previousFacadeApplication;
    private bool $applicationReplaced = false;

    protected function tearDown(): void
    {
        try {
            if (isset($this->db)) {
                // Test tables may have surviving or newly repaired constraints.
                if ($this->db->getIsMysql()) {
                    $this->db->createCommand('SET FOREIGN_KEY_CHECKS = 0')->execute();
                }
                foreach (array_reverse($this->tables) as $table) {
                    $this->db->createCommand('DROP TABLE IF EXISTS '.$this->db->quoteTableName($table).($this->db->getIsMysql() ? '' : ' CASCADE'))->execute();
                }
                foreach ($this->functions as $function) {
                    $this->db->createCommand('DROP FUNCTION IF EXISTS '.$this->db->quoteTableName($function).'()')->execute();
                }
                $this->db->close();
            }
        } finally {
            if ($this->applicationReplaced) {
                \Craft::$app->getErrorHandler()->unregister();
                \Craft::$app = $this->previousCraftApp;
                \Yii::$app = $this->previousYiiApp;
                Facade::clearResolvedInstances();
                Facade::setFacadeApplication($this->previousFacadeApplication);
                Container::setInstance($this->previousLaravelContainer);
            }
        }
    }

    #[DataProvider('databases')]
    public function testCommandPreviewCleanupAndRepair(string $driver): void
    {
        $this->connect($driver);
        $this->seed();
        $before = $this->snapshot();

        [$code, $output] = $this->command('delete-orphans');
        $this->assertSame(ExitCode::UNSPECIFIED_ERROR, $code, $output);
        $this->assertStringContainsString('Rows to delete: 22', $output);
        $this->assertStringContainsString('References to clear: 3', $output);
        $this->assertSame($before, $this->snapshot());

        [$code, $output] = $this->command('delete-orphans', ['apply' => '1', 'dry-run' => '1']);
        $this->assertSame(ExitCode::UNSPECIFIED_ERROR, $code, $output);
        $this->assertSame($before, $this->snapshot());

        [$code, $output] = $this->command('delete-orphans', ['apply' => '1']);
        $this->assertSame(ExitCode::OK, $code, $output);
        $this->assertStringContainsString('Deleted rows: 22', $output);
        $this->assertStringContainsString('Cleared references: 3', $output);
        $this->assertSame([1, 6], $this->ids('freeform_submissions'));
        $this->assertSame([1, 6], $this->ids('freeform_submissions_contact_1'));
        $this->assertSame([1, 6, 9], $this->ids('freeform_submissions_tracking_parameters'));
        $this->assertSame([1], $this->ids('freeform_integrations_queue'));
        $this->assertSame([1], $this->ids('freeform_forms_layouts'));
        $this->assertSame([1], $this->ids('freeform_forms_rows'));
        $this->assertSame([1, 2], $this->ids('freeform_forms_fields'));
        $this->assertSame([1, 2], $this->ids('freeform_forms'));
        $this->assertSame([1, 3, 4, 5, 6], $this->ids('elements'));
        $this->assertSame(999, (int) $this->db->createCommand('SELECT [[id]] FROM '.$this->db->quoteTableName('backup_'.$this->db->tablePrefix.'freeform_submissions_contact_1'))->queryScalar());
        $this->assertNull($this->db->createCommand('SELECT [[rowId]] FROM {{%freeform_forms_fields}} WHERE [[id]] = 2')->queryScalar());
        $this->assertNull($this->db->createCommand('SELECT [[createdByUserId]] FROM {{%freeform_forms}} WHERE [[id]] = 2')->queryScalar());

        $after = $this->snapshot();
        [$code, $output] = $this->command('delete-orphans', ['apply' => '1']);
        $this->assertSame(ExitCode::OK, $code, $output);
        $this->assertStringContainsString('Deleted rows: 0', $output);
        $this->assertSame($after, $this->snapshot());

        [$code, $output] = $this->command('repair-foreign-keys', ['apply' => '1']);
        $this->assertSame(ExitCode::OK, $code, $output);
        $repair = new ForeignKeyRepair($this->db);
        foreach ($repair->getDefinitions() as $definition) {
            $this->assertSame('ok', $repair->inspect($definition)['status'], $definition[1]);
        }
        [$code, $output] = $this->command('delete-orphans', ['apply' => '1']);
        $this->assertSame(ExitCode::OK, $code, $output);
        $this->assertSame($after, $this->snapshot());
    }

    #[DataProvider('databases')]
    public function testDatabaseFailureRollsBackEarlierChildDeletes(string $driver): void
    {
        $this->connect($driver);
        $this->seed();
        $before = $this->snapshot();
        $table = $this->db->quoteTableName('{{%freeform_submissions}}');
        $trigger = $this->db->quoteTableName($this->db->tablePrefix.'fail_cleanup');
        if ($this->db->getIsMysql()) {
            $this->db->createCommand('CREATE TRIGGER '.$trigger.' BEFORE DELETE ON '.$table." FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'integration cleanup failure'")->execute();
        } else {
            $function = $this->db->tablePrefix.'fail_cleanup_fn';
            $this->functions[] = $function;
            $quoted = $this->db->quoteTableName($function);
            $this->db->createCommand('CREATE FUNCTION '.$quoted.'() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION \'integration cleanup failure\'; END; $$')->execute();
            $this->db->createCommand('CREATE TRIGGER '.$trigger.' BEFORE DELETE ON '.$table.' FOR EACH ROW EXECUTE FUNCTION '.$quoted.'()')->execute();
        }

        [$code, $output] = $this->command('delete-orphans', ['apply' => '1']);
        $this->assertSame(ExitCode::UNSPECIFIED_ERROR, $code, $output);
        $this->assertStringContainsString('integration cleanup failure', $output);
        $this->assertStringContainsString('No cleanup changes were committed', $output);
        $this->assertSame($before, $this->snapshot());
    }

    #[DataProvider('databases')]
    public function testSurvivingForeignKeys(string $driver): void
    {
        $this->connect($driver);
        $repair = new ForeignKeyRepair($this->db);
        foreach ($repair->getDefinitions() as $definition) {
            if ($this->db->getSchema()->getRawTableName($definition[3]) === $this->db->tablePrefix.'freeform_submissions') {
                $repair->restore($definition);
            }
        }
        $this->insert('elements', [['id' => 1]]);
        $this->insert('freeform_forms', [['id' => 1]]);
        $this->insert('freeform_submissions', [['id' => 1, 'formId' => 1], ['id' => 2, 'formId' => 1]]);
        $this->insert('freeform_submissions_contact_1', [['id' => 1], ['id' => 2]]);
        $this->insert('freeform_submissions_tracking_parameters', [['id' => 1, 'submissionId' => 1], ['id' => 2, 'submissionId' => 2]]);
        [$code, $output] = $this->command('delete-orphans', ['dry-run' => '1']);
        $this->assertSame(ExitCode::UNSPECIFIED_ERROR, $code, $output);
        $this->assertStringContainsString('Rows to delete: 3', $output);
        [$code, $output] = $this->command('delete-orphans', ['apply' => '1']);
        $this->assertSame(ExitCode::OK, $code, $output);
        $this->assertStringContainsString('Deleted rows: 3', $output);
        $this->assertSame([1], $this->ids('freeform_submissions_contact_1'));
        $this->assertSame([1], $this->ids('freeform_submissions_tracking_parameters'));
    }

    public static function databases(): array
    {
        return ['MySQL' => ['mysql'], 'PostgreSQL' => ['pgsql']];
    }

    private function connect(string $driver): void
    {
        $variable = 'FREEFORM_TEST_'.strtoupper($driver);
        $dsn = getenv($variable.'_DSN');
        if (!$dsn) {
            $this->markTestSkipped('Set '.$variable.'_DSN to run live database integration tests.');
        }
        $this->previousCraftApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $this->previousLaravelContainer = Container::getInstance();
        $this->previousFacadeApplication = Facade::getFacadeApplication();
        $laravel = new \Illuminate\Foundation\Application(sys_get_temp_dir());
        $parts = [];
        foreach (explode(';', substr($dsn, strpos($dsn, ':') + 1)) as $part) {
            [$key, $value] = array_pad(explode('=', $part, 2), 2, '');
            $parts[$key] = $value;
        }
        $prefix = 'ffit_'.bin2hex(random_bytes(4)).'_';
        $laravel->instance('config', new Repository([
            'database' => ['default' => $driver, 'connections' => [$driver => [
                'driver' => $driver,
                'host' => $parts['host'] ?? '127.0.0.1',
                'port' => $parts['port'] ?? ('mysql' === $driver ? '3306' : '5432'),
                'database' => $parts['dbname'],
                'username' => getenv($variable.'_USER') ?: ('mysql' === $driver ? 'root' : 'postgres'),
                'password' => getenv($variable.'_PASSWORD') ?: '',
                'charset' => 'utf8',
                'prefix' => $prefix,
            ]]],
        ]));
        (new DatabaseServiceProvider($laravel))->register();
        Facade::clearResolvedInstances();
        Facade::setFacadeApplication($laravel);
        $context = new \Illuminate\Log\Context\Repository(new Dispatcher($laravel));
        $context->addHidden('craft.isInstalled', true);
        $laravel->instance(\Illuminate\Log\Context\Repository::class, $context);
        $this->applicationReplaced = true;
        $app = new class(['id' => 'freeform-database-tests', 'basePath' => sys_get_temp_dir(), 'runtimePath' => sys_get_temp_dir(), 'bootstrap' => []]) extends Application {
            public function getIsInstalled(): bool
            {
                return true;
            }
        };
        \Craft::$app = $app;
        $this->db = new Connection([
            'dsn' => $dsn,
            'username' => getenv($variable.'_USER') ?: ('mysql' === $driver ? 'root' : 'postgres'),
            'password' => getenv($variable.'_PASSWORD') ?: '',
            'tablePrefix' => $prefix,
            'schemaCache' => null,
            'enableSchemaCache' => false,
            'enableLogging' => false,
            'enableProfiling' => false,
            'schemaMap' => [$driver => 'craft\db\\'.$driver.'\Schema'],
            'commandMap' => [$driver => Command::class],
            'supportsMb4' => true,
        ]);
        $app->set('db', $this->db);
        $this->db->open();

        // Use every shipped relationship and real schema discovery. The fixture
        // needs FK columns only; no installed Craft site or customer data is used.
        $columns = [];
        foreach ((new ForeignKeyRepair($this->db))->getDefinitions() as $definition) {
            foreach ([1 => 2, 3 => 4] as $tableIndex => $columnIndex) {
                $table = $this->db->getSchema()->getRawTableName($definition[$tableIndex]);
                foreach ((array) $definition[$columnIndex] as $column) {
                    $columns[$table][$column] = true;
                }
            }
        }
        $columns[$this->db->tablePrefix.'freeform_submissions_contact_1']['id'] = true;
        $columns['backup_'.$this->db->tablePrefix.'freeform_submissions_contact_1']['id'] = true;
        foreach ($columns as $table => $fields) {
            $this->tables[] = $table;
            unset($fields['id']);
            $fields = array_merge(['id' => 'INTEGER PRIMARY KEY'], array_fill_keys(array_keys($fields), 'INTEGER NULL'));
            $parts = [];
            foreach ($fields as $name => $type) {
                $parts[] = $this->db->quoteColumnName($name).' '.$type;
            }
            $this->db->createCommand('CREATE TABLE '.$this->db->quoteTableName($table).' ('.implode(', ', $parts).')'.('mysql' === $driver ? ' ENGINE=InnoDB' : ''))->execute();
        }
        $this->db->getSchema()->refresh();
    }

    private function seed(): void
    {
        $this->insert('users', [['id' => 1]]);
        $this->insert('freeform_statuses', [['id' => 1]]);
        $this->insert('elements', array_map(static fn ($id) => ['id' => $id], [1, 3, 4, 5, 6]));
        $this->insert('freeform_forms', [['id' => 1, 'createdByUserId' => 1, 'updatedByUserId' => 1], ['id' => 2, 'createdByUserId' => 999, 'updatedByUserId' => 999]]);
        $this->insert('freeform_submissions', [
            ['id' => 1, 'formId' => 1, 'userId' => 1, 'statusId' => 1],
            ['id' => 2, 'formId' => 1, 'userId' => 1, 'statusId' => 1],
            ['id' => 3, 'formId' => 999, 'userId' => 1, 'statusId' => 1],
            ['id' => 4, 'formId' => 1, 'userId' => 999, 'statusId' => 1],
            ['id' => 5, 'formId' => 1, 'userId' => 1, 'statusId' => 999],
            ['id' => 6, 'formId' => 1, 'userId' => null, 'statusId' => null],
            ['id' => 7, 'formId' => 999, 'userId' => 999, 'statusId' => 999],
        ]);
        $this->insert('freeform_submissions_contact_1', array_map(static fn ($id) => ['id' => $id], range(1, 8)));
        $this->insert('freeform_submissions_tracking_parameters', array_merge(array_map(static fn ($id) => ['id' => $id, 'submissionId' => $id], range(1, 7)), [['id' => 8, 'submissionId' => 999], ['id' => 9, 'submissionId' => null]]));
        $this->insert('freeform_integrations_queue', [['id' => 1, 'submissionId' => 1], ['id' => 2, 'submissionId' => 2], ['id' => 3, 'submissionId' => 999]]);
        $this->insert('freeform_forms_layouts', [['id' => 1, 'formId' => 1], ['id' => 2, 'formId' => 999]]);
        $this->insert('freeform_forms_rows', [['id' => 1, 'formId' => 1, 'layoutId' => 1], ['id' => 2, 'formId' => 1, 'layoutId' => 2]]);
        $this->insert('freeform_forms_fields', [['id' => 1, 'formId' => 1, 'rowId' => 1], ['id' => 2, 'formId' => 1, 'rowId' => 2], ['id' => 3, 'formId' => 999, 'rowId' => null]]);
        $this->db->createCommand()->insert('backup_'.$this->db->tablePrefix.'freeform_submissions_contact_1', ['id' => 999])->execute();
    }

    private function insert(string $table, array $rows): void
    {
        foreach ($rows as $row) {
            $this->db->createCommand()->insert('{{%'.$table.'}}', $row)->execute();
        }
    }

    private function ids(string $table): array
    {
        return array_map('intval', $this->db->createCommand('SELECT [[id]] FROM {{%'.$table.'}} ORDER BY [[id]]')->queryColumn());
    }

    private function snapshot(): array
    {
        $rows = [];
        foreach ($this->tables as $table) {
            $rows[$table] = $this->db->createCommand('SELECT * FROM '.$this->db->quoteTableName($table).' ORDER BY [[id]]')->queryAll();
        }

        return $rows;
    }

    private function command(string $action, array $options = []): array
    {
        $output = '';
        $controller = $this->getMockBuilder(DatabaseController::class)
            ->setConstructorArgs(['database', \Craft::$app, ['interactive' => false, 'color' => false]])
            ->onlyMethods(['stdout', 'stderr'])
            ->getMock()
        ;
        $capture = static function ($text) use (&$output) { $output .= $text; };
        $controller->method('stdout')->willReturnCallback($capture);
        $controller->method('stderr')->willReturnCallback($capture);

        return [$controller->runAction($action, $options), $output];
    }
}
