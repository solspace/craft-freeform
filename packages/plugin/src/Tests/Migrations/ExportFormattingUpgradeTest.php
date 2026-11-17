<?php

namespace Solspace\Freeform\Tests\Migrations;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Configuration\ExportFormatting;
use Solspace\Freeform\Library\Configuration\ExportFormattingUpgrade;
use Solspace\Freeform\Library\DataObjects\ExportSettings;
use Solspace\Freeform\migrations\m261116_201500_MoveExportFormattingToExports;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use yii\db\Connection;

#[CoversNothing]
class ExportFormattingUpgradeTest extends TestCase
{
    use UsesCraft6Container;

    public function testEveryLegacyCombinationRetainsTheSameExporterBehavior(): void
    {
        for ($bits = 0; $bits < 16; ++$bits) {
            $legacy = [];
            foreach (ExportFormatting::LEGACY_KEYS as $index => $key) {
                $legacy[$key] = ($bits & (1 << $index)) ? 'true' : 'false';
            }
            $settings = ExportSettings::fromFormatting(ExportFormatting::fromLegacySettings($legacy), 'Europe/Berlin');
            self::assertSame((bool) ($bits & 1), $settings->isRemoveNewlines());
            self::assertSame((bool) ($bits & 2), $settings->isExportLabels());
            self::assertSame((bool) ($bits & 4), $settings->isHandlesAsNames());
            self::assertSame((bool) ($bits & 8), $settings->isExportTrackedUrlParameters());
            self::assertSame('Europe/Berlin', $settings->getTimezone());
        }
    }

    public function testEarlierMigrationsKeepValuesUntilExportMigrationAndRuntimeDiscardsRetiredKeys(): void
    {
        $legacy = ['pluginName' => 'Preserved', 'removeNewlines' => 'true', 'exportLabels' => 'false', 'exportHandlesAsNames' => 'true', 'exportTrackedUrlParameters' => 'true'];
        $early = Settings::normalizeLegacySettings($legacy, preserveExportFormatting: true);
        foreach (ExportFormatting::LEGACY_KEYS as $key) {
            self::assertSame($legacy[$key], $early[$key]);
        }
        self::assertSame(ExportFormatting::fromLegacySettings($legacy), ExportFormatting::fromLegacySettings($early));
        $settings = new Settings($legacy);
        self::assertSame('Preserved', $settings->pluginName);
        foreach (ExportFormatting::LEGACY_KEYS as $key) {
            self::assertArrayNotHasKey($key, $settings->toArray());
        }
    }

    public function testEnvironmentValuesAreResolvedIntoIndependentExportPreferences(): void
    {
        $before = $_SERVER;

        try {
            $_SERVER['FF_EXPORT_FORMATTING'] = 'yes';
            $legacy = array_fill_keys(ExportFormatting::LEGACY_KEYS, '$FF_EXPORT_FORMATTING');
            self::assertSame(['headings' => 'handles', 'options' => 'labels', 'multiline' => 'singleLine', 'tracking' => 'include'], ExportFormatting::fromLegacySettings($legacy));
        } finally {
            $_SERVER = $before;
        }
    }

    #[TestWith([false, ''])]
    #[TestWith([true, 'craft_'])]
    public function testRealMigrationAddsColumnsHonorsPhpOverridesAndSupportsReadOnlyConfig(bool $readOnly, string $prefix): void
    {
        config(['database.connections.testing.prefix' => $prefix]);
        $db = new class(['dsn' => 'sqlite::memory:', 'tablePrefix' => $prefix]) extends \craft\db\Connection {
            public function tableExists(string $table, ?bool $refresh = null): bool
            {
                return parent::tableExists($table, true);
            }

            public function columnExists(string $table, string $column, ?bool $refresh = null): bool
            {
                return parent::columnExists($table, $column, true);
            }
        };
        $projectConfig = new class($readOnly) {
            public array $settings = ['pluginName' => 'Keep me', 'removeNewlines' => 'true', 'exportLabels' => 'true'];

            public function __construct(public bool $readOnly) {}

            public function get($path)
            {
                return $this->settings;
            }

            public function set($path, $settings, $message): void
            {
                $this->settings = $settings;
            }
        };
        $previousCraft = \Craft::$app;
        $previousYii = \Yii::$app;
        \Craft::$app = \Yii::$app = new class($db, $projectConfig) {
            public object $config;

            public function __construct(private \craft\db\Connection $db, public object $projectConfig)
            {
                $this->config = new class {
                    public function getConfigFromFile($name)
                    {
                        return ['exportLabels' => false, 'exportHandlesAsNames' => true];
                    }
                };
            }

            public function getDb()
            {
                return $this->db;
            }

            public function get($id, $throwException = true)
            {
                return null;
            }
        };
        foreach (['users' => ['id' => 'integer PRIMARY KEY'], 'freeform_export_profiles' => ['id' => 'integer PRIMARY KEY'], 'freeform_export_settings' => ['id' => 'integer PRIMARY KEY', 'userId' => 'integer', 'setting' => 'text']] as $table => $columns) {
            $db->createCommand()->createTable('{{%'.$table.'}}', $columns)->execute();
        }
        $db->createCommand()->insert('{{%users}}', ['id' => 7])->execute();
        $db->createCommand()->insert('{{%freeform_export_profiles}}', ['id' => 8])->execute();
        ob_start();

        try {
            $migration = new m261116_201500_MoveExportFormattingToExports(['db' => $db]);
            self::assertTrue($migration->up());
            $formatting = json_decode($db->createCommand('SELECT formatting FROM {{%freeform_export_profiles}} WHERE id = 8')->queryScalar(), true);
            self::assertSame(['headings' => 'handles', 'options' => 'values', 'multiline' => 'singleLine', 'tracking' => 'exclude'], $formatting);
            self::assertSame($formatting, json_decode($db->createCommand('SELECT formatting FROM {{%freeform_export_settings}} WHERE userId = 7')->queryScalar(), true));
            self::assertSame('Keep me', $projectConfig->settings['pluginName']);
            self::assertSame($readOnly, \array_key_exists('removeNewlines', $projectConfig->settings));
            self::assertTrue($migration->up());
            self::assertSame($formatting, json_decode($db->createCommand('SELECT formatting FROM {{%freeform_export_profiles}} WHERE id = 8')->queryScalar(), true));
        } finally {
            ob_end_clean();
            \Craft::$app = $previousCraft;
            \Yii::$app = $previousYii;
            $db->close();
        }
    }

    public function testMigrationSeedsAllProfilesAndUsersWithoutLosingFieldSelectionsOrOverwritingPreferences(): void
    {
        $db = new Connection(['dsn' => 'sqlite::memory:']);
        $db->createCommand('CREATE TABLE users (id INTEGER PRIMARY KEY)')->execute();
        $db->createCommand('CREATE TABLE freeform_export_profiles (id INTEGER PRIMARY KEY, formatting TEXT)')->execute();
        $db->createCommand('CREATE TABLE freeform_export_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, setting TEXT, formatting TEXT, dateCreated TEXT, dateUpdated TEXT, uid TEXT)')->execute();
        for ($id = 1; $id <= 405; ++$id) {
            $db->createCommand()->insert('users', ['id' => $id])->execute();
        }
        $chosen = array_replace(ExportFormatting::DEFAULTS, ['headings' => 'handles']);
        $db->createCommand()->insert('freeform_export_profiles', ['id' => 1, 'formatting' => null])->execute();
        $db->createCommand()->insert('freeform_export_profiles', ['id' => 2, 'formatting' => json_encode($chosen)])->execute();
        $fields = json_encode([12 => ['email' => ['label' => 'Email', 'checked' => false]]]);
        $db->createCommand()->insert('freeform_export_settings', ['userId' => 1, 'setting' => $fields])->execute();
        $db->createCommand()->insert('freeform_export_settings', ['userId' => 2, 'setting' => '{}', 'formatting' => json_encode($chosen)])->execute();
        $previous = \Craft::$app;
        \Craft::$app = new class($db) {
            public function __construct(public Connection $db) {}

            public function getDb(): Connection
            {
                return $this->db;
            }
        };

        try {
            $legacy = ['exportLabels' => 'false', 'removeNewlines' => 'true', 'exportTrackedUrlParameters' => 'true'];
            ExportFormattingUpgrade::seed($db, $legacy);
            $expected = ExportFormatting::fromLegacySettings($legacy);
            self::assertSame(405, (int) $db->createCommand('SELECT COUNT(*) FROM freeform_export_settings')->queryScalar());
            self::assertSame($expected, json_decode($db->createCommand('SELECT formatting FROM freeform_export_settings WHERE userId = 405')->queryScalar(), true));
            self::assertSame($fields, $db->createCommand('SELECT setting FROM freeform_export_settings WHERE userId = 1')->queryScalar());
            self::assertSame($chosen, json_decode($db->createCommand('SELECT formatting FROM freeform_export_settings WHERE userId = 2')->queryScalar(), true));
            self::assertSame($expected, json_decode($db->createCommand('SELECT formatting FROM freeform_export_profiles WHERE id = 1')->queryScalar(), true));
            self::assertSame($chosen, json_decode($db->createCommand('SELECT formatting FROM freeform_export_profiles WHERE id = 2')->queryScalar(), true));
            ExportFormattingUpgrade::seed($db, []);
            self::assertSame(405, (int) $db->createCommand('SELECT COUNT(*) FROM freeform_export_settings')->queryScalar());
            self::assertSame($expected, json_decode($db->createCommand('SELECT formatting FROM freeform_export_profiles WHERE id = 1')->queryScalar(), true));
        } finally {
            \Craft::$app = $previous;
            $db->close();
        }
    }
}
