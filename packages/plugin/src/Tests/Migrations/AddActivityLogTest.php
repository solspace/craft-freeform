<?php

namespace Solspace\Freeform\Tests\Migrations;

use craft\models\ProjectConfigData;
use craft\models\ReadOnlyProjectConfigData;
use craft\services\ProjectConfig;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Activity\ActivityTable;
use Solspace\Freeform\migrations\m261028_120000_AddActivityLog;
use yii\base\Application;
use yii\db\Connection;

#[CoversClass(m261028_120000_AddActivityLog::class)]
class AddActivityLogTest extends TestCase
{
    #[TestWith([true, '5.17.7', null, null, null])]
    #[TestWith([true, null, null, null, null])]
    #[TestWith([true, '5.17.7', 'custom', null, 'custom'])]
    #[TestWith([true, '5.18.0.3', null, 'minimal', null])]
    #[TestWith([true, '5.18.0.3', null, 'detailed', null])]
    #[TestWith([false, '5.18.0.3', null, 'minimal', null])]
    #[TestWith([false, '5.18.0.3', null, 'detailed', null])]
    #[TestWith([false, '5.18.0.3', null, null, null])]
    #[TestWith([false, '5.19.0', null, 'custom', null])]
    #[TestWith([false, '5.17.7', null, null, 'minimal'])]
    #[TestWith([false, null, null, null, 'minimal'])]
    #[TestWith([false, '5.17.7', 'standard', null, 'standard'])]
    #[TestWith([false, '5.17.7', 'custom', null, 'custom'])]
    public function testUpgradeCreatesTheTableWithoutOverwritingReadOnlyOrDeployedConfig(
        bool $readOnly,
        ?string $incomingSchemaVersion,
        ?string $storedMode,
        ?string $incomingMode,
        ?string $expectedMode,
    ): void {
        $previousApp = \Craft::$app;
        $previousYii = \Yii::$app;
        $db = new class(['dsn' => 'sqlite::memory:']) extends Connection {
            public function tableExists(string $table): bool
            {
                return null !== $this->getTableSchema($table, true);
            }
        };
        // Keep Craft's real get/set methods, including its read-only exception.
        $config = $this->getMockBuilder(ProjectConfig::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['getCurrentWorkingConfig', 'getExternalConfig'])
            ->getMock()
        ;
        $config->readOnly = $readOnly;
        $config->writeYamlAutomatically = false;
        $config->muteEvents = true;
        $working = new ProjectConfigData(['plugins' => ['freeform' => ['settings' => ['activityMode' => $storedMode]]]], $config);
        $incoming = new ReadOnlyProjectConfigData(['plugins' => ['freeform' => [
            'schemaVersion' => $incomingSchemaVersion,
            'settings' => ['activityMode' => $incomingMode],
        ]]], $config);
        $config->method('getCurrentWorkingConfig')->willReturn($working);
        $config->method('getExternalConfig')->willReturn($incoming);
        $originalWorking = $working->export();
        $originalIncoming = $incoming->export();
        \Craft::$app = \Yii::$app = new class($db, $config) {
            public int $state = Application::STATE_INIT;

            public function __construct(private Connection $db, public ProjectConfig $projectConfig) {}

            public function getDb(): Connection
            {
                return $this->db;
            }

            public function getProjectConfig(): ProjectConfig
            {
                return $this->projectConfig;
            }

            public function getIsInstalled(): bool
            {
                return false;
            }

            public function getMutex(): object
            {
                return new class {
                    public function acquire(string $name): bool
                    {
                        return true;
                    }
                };
            }

            public function get(string $id, bool $throwException = true): mixed
            {
                return null;
            }
        };
        ob_start();

        try {
            $migration = new m261028_120000_AddActivityLog(['db' => $db]);
            self::assertTrue($migration->safeUp());
            self::assertTrue($migration->safeUp());
            self::assertTrue($db->tableExists(ActivityTable::TABLE));
            self::assertCount(7, $db->createCommand('PRAGMA index_list(freeform_activity)')->queryAll());
            self::assertSame($expectedMode, $config->get('plugins.freeform.settings.activityMode'));
            self::assertSame($originalIncoming, $incoming->export());
            self::assertSame($readOnly, $config->readOnly);
            if ($expectedMode === $storedMode) {
                self::assertSame($originalWorking, $working->export());
            }
        } finally {
            ob_end_clean();
            $db->close();
            \Craft::$app = $previousApp;
            \Yii::$app = $previousYii;
        }
    }
}
