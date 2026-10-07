<?php

namespace Solspace\Freeform\Tests\Bundles\Migrations;

use craft\base\PluginInterface;
use craft\events\PluginEvent;
use craft\services\Plugins;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Migrations\RemoveForeignKeys;
use Solspace\Freeform\Freeform;
use yii\base\Event;

#[CoversClass(RemoveForeignKeys::class)]
class RemoveForeignKeysTest extends TestCase
{
    private mixed $originalApp;
    private mixed $originalYiiApp;
    private ?RemoveForeignKeys $bundle = null;

    protected function setUp(): void
    {
        $this->originalApp = \Craft::$app;
        $this->originalYiiApp = \Yii::$app;
    }

    protected function tearDown(): void
    {
        if ($this->bundle) {
            Event::off(Plugins::class, Plugins::EVENT_BEFORE_UNINSTALL_PLUGIN, [$this->bundle, 'handleRemoveForeignKeys']);
        }
        \Craft::$app = $this->originalApp;
        \Yii::$app = $this->originalYiiApp;
    }

    public function testUninstallingAnotherPluginDoesNotAccessTheDatabase(): void
    {
        $freeform = (new \ReflectionClass(Freeform::class))->newInstanceWithoutConstructor();
        $app = new class {
            public array $loadedModules = [];

            public function getDb(): never
            {
                throw new \RuntimeException('The database must not be accessed for another plugin.');
            }
        };
        $app->loadedModules[Freeform::class] = $freeform;
        \Craft::$app = \Yii::$app = $app;
        $event = new PluginEvent(['plugin' => $this->createMock(PluginInterface::class)]);

        $this->bundle = new RemoveForeignKeys();
        Event::trigger(Plugins::class, Plugins::EVENT_BEFORE_UNINSTALL_PLUGIN, $event);
        $this->addToAssertionCount(1);
    }

    public function testFreeformUninstallOnlyDropsKeysOnItsOwnPrefixedTables(): void
    {
        $freeform = (new \ReflectionClass(Freeform::class))->newInstanceWithoutConstructor();
        $db = new class {
            public string $tablePrefix = 'site.';
            public object $schema;
            public array $dropped = [];

            public function createCommand(): object
            {
                return new class($this) {
                    public function __construct(private object $db) {}

                    public function dropForeignKey(string $name, string $table): self
                    {
                        $this->db->dropped[] = [$name, $table];

                        return $this;
                    }

                    public function execute(): void {}
                };
            }
        };
        $db->schema = new class {
            public function getTableSchemas(): array
            {
                return array_map(static fn ($name) => (object) [
                    'name' => $name,
                    'foreignKeys' => ['example_fk' => ['id' => 'id']],
                ], ['site.freeform_submissions', 'site.freeform_submissions_contact_1', 'backup_site.freeform_submissions', 'siteXfreeform_submissions', 'site.entries']);
            }
        };
        $app = new class($db) {
            public array $loadedModules = [];

            public function __construct(private object $db) {}

            public function getDb(): object
            {
                return $this->db;
            }
        };
        $app->loadedModules[Freeform::class] = $freeform;
        \Craft::$app = \Yii::$app = $app;

        $this->bundle = new RemoveForeignKeys();
        Event::trigger(Plugins::class, Plugins::EVENT_BEFORE_UNINSTALL_PLUGIN, new PluginEvent(['plugin' => $freeform]));

        $this->assertSame([
            ['example_fk', 'site.freeform_submissions'],
            ['example_fk', 'site.freeform_submissions_contact_1'],
        ], $db->dropped);
    }
}
