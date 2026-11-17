<?php

namespace Solspace\Freeform\Tests\Migrations;

use craft\db\Connection;
use craft\services\ProjectConfig;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\migrations\m261116_173000_ConsolidateErrorAlertsAndRemoveNotices;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversClass(m261116_173000_ConsolidateErrorAlertsAndRemoveNotices::class)]
class ConsolidateErrorAlertsAndRemoveNoticesTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith([false, '5.18.4', ''])]
    #[TestWith([false, '6.0.0', 'craft_'])]
    #[TestWith([false, null, ''])]
    #[TestWith([true, '5.18.4', 'craft_'])]
    #[TestWith([false, '6.0.1', ''])]
    public function testUpgradePreservesRecipientsAndUnrelatedSettingsWhileDroppingOnlyFeedTables(bool $readOnly, ?string $incomingSchema, string $prefix): void
    {
        config(['database.connections.testing.prefix' => $prefix]);
        $db = new class(['dsn' => 'sqlite::memory:', 'tablePrefix' => $prefix]) extends Connection {
            public function tableExists(string $table, ?bool $refresh = null): bool
            {
                return null !== $this->getTableSchema($table, true);
            }
        };
        $db->createCommand('PRAGMA foreign_keys = ON')->execute();
        $db->createCommand('CREATE TABLE {{%freeform_feeds}} (id INTEGER PRIMARY KEY)')->execute();
        $db->createCommand('CREATE TABLE {{%freeform_feed_messages}} (id INTEGER PRIMARY KEY, feedId INTEGER REFERENCES {{%freeform_feeds}}(id))')->execute();
        $db->createCommand('INSERT INTO {{%freeform_feeds}} (id) VALUES (1)')->execute();
        $db->createCommand('INSERT INTO {{%freeform_feed_messages}} (id, feedId) VALUES (1, 1)')->execute();
        $db->createCommand('CREATE TABLE {{%freeform_forms}} (id INTEGER PRIMARY KEY)')->execute();
        $stored = ['errorNotificationRecipients' => 'ops@example.test, shared@example.test', 'alertNotificationRecipients' => 'SHARED@example.test, mail@example.test', 'displayFeed' => 'true', 'badgeType' => 'all', 'sessionContextSecret' => 'preserve-key', 'pluginName' => 'Custom name'];
        $original = $stored;
        $config = $this->getMockBuilder(ProjectConfig::class)->disableOriginalConstructor()->onlyMethods(['get', 'set'])->getMock();
        $config->readOnly = $readOnly;
        $config->method('get')->willReturnCallback(static function ($path, $external = false) use (&$stored, $incomingSchema) {
            return $external ? $incomingSchema : $stored;
        });
        $writable = !$readOnly && (null === $incomingSchema || version_compare($incomingSchema, '6.0.1', '<'));
        $config->expects($writable ? self::once() : self::never())->method('set')->willReturnCallback(static function ($path, $settings) use (&$stored) {
            self::assertSame('plugins.freeform.settings', $path);
            $stored = $settings;

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
            $migration = new m261116_173000_ConsolidateErrorAlertsAndRemoveNotices(['db' => $db]);
            self::assertTrue($migration->up());
            self::assertTrue($migration->up());
            self::assertFalse($db->tableExists('{{%freeform_feed_messages}}'));
            self::assertFalse($db->tableExists('{{%freeform_feeds}}'));
            self::assertTrue($db->tableExists('{{%freeform_forms}}'));
            if (!$writable) {
                self::assertSame($original, $stored);
            }
            $effective = (new Settings($stored))->toArray();
            self::assertSame('ops@example.test, shared@example.test, mail@example.test', $effective['errorNotificationRecipients']);
            self::assertArrayNotHasKey('alertNotificationRecipients', $effective);
            self::assertArrayNotHasKey('displayFeed', $effective);
            self::assertSame('errors', $effective['badgeType']);
            self::assertSame('preserve-key', $effective['sessionContextSecret']);
            self::assertSame('Custom name', $effective['pluginName']);
        } finally {
            ob_end_clean();
            $db->close();
            \Craft::$app = $before;
            \Yii::$app = $beforeYii;
        }
    }
}
