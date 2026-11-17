<?php

namespace Solspace\Freeform\Tests\Migrations;

use craft\db\Connection;
use craft\services\ProjectConfig;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Configuration\PayloadContextUpgrade;
use Solspace\Freeform\migrations\m261116_192000_UseEncryptedPayloadContext;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversNothing]
class PayloadContextUpgradeTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith(['session', false])]
    #[TestWith(['database', false])]
    #[TestWith(['payload', false])]
    #[TestWith(['database', true])]
    public function testUpgradeRemovesOnlyTransientSessionStorageAndPreservesSavedFormsAndEncryptionKey(string $mode, bool $readOnly): void
    {
        $db = new class(['dsn' => 'sqlite::memory:']) extends Connection {
            public function tableExists(string $table, ?bool $refresh = null): bool
            {
                return null !== $this->getTableSchema($table, true);
            }
        };
        $db->createCommand('CREATE TABLE {{%freeform_session_context}} (id INTEGER PRIMARY KEY)')->execute();
        $db->createCommand('CREATE TABLE {{%freeform_saved_forms}} (id INTEGER PRIMARY KEY, payload TEXT)')->execute();
        $db->createCommand("INSERT INTO {{%freeform_saved_forms}} VALUES (1, 'saved-progress')")->execute();
        $stored = ['sessionContext' => $mode, 'sessionContextCount' => 20, 'sessionContextTimeToLiveMinutes' => 45, 'sessionEntryTTL' => 30, 'sessionEntryMaxCount' => 10, 'sessionContextSecret' => 'existing-key', 'saveFormTtl' => 60];
        $original = $stored;
        $config = $this->getMockBuilder(ProjectConfig::class)->disableOriginalConstructor()->onlyMethods(['get', 'set'])->getMock();
        $config->readOnly = $readOnly;
        $config->method('get')->willReturnCallback(static function ($path, $external = false) use (&$stored) { return $external ? '6.0.5' : $stored; });
        $config->expects($readOnly ? self::never() : self::once())->method('set')->willReturnCallback(static function ($path, $value) use (&$stored) {
            $stored = $value;

            return true;
        });
        $before = \Craft::$app;
        $beforeYii = \Yii::$app;
        \Craft::$app = \Yii::$app = new class($config) {
            public function __construct(public ProjectConfig $projectConfig) {}

            public function get(string $id, bool $throwException = true): mixed
            {
                return null;
            }

            public function getIsInstalled(): bool
            {
                return false;
            }
        };
        ob_start();

        try {
            $migration = new m261116_192000_UseEncryptedPayloadContext(['db' => $db]);
            self::assertTrue($migration->up());
            self::assertTrue($migration->up());
            self::assertFalse($db->tableExists('{{%freeform_session_context}}'));
            self::assertSame('saved-progress', $db->createCommand('SELECT payload FROM {{%freeform_saved_forms}} WHERE id = 1')->queryScalar());
            if ($readOnly) {
                self::assertSame($original, $stored);
            }
            $effective = (new Settings($stored))->toArray();
            foreach (PayloadContextUpgrade::RETIRED_KEYS as $key) {
                self::assertArrayNotHasKey($key, $effective);
            }
            self::assertSame('existing-key', $effective['sessionContextSecret']);
            self::assertSame(60, $effective['saveFormTtl']);
        } finally {
            ob_end_clean();
            \Craft::$app = $before;
            \Yii::$app = $beforeYii;
            $db->close();
        }
    }
}
