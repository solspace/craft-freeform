<?php

namespace Solspace\Freeform\Tests\Migrations;

use craft\db\Connection;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\migrations\m261116_143000_AddAllowedExportTypesToProfiles;
use Solspace\Freeform\Records\Pro\ExportProfileRecord;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversClass(m261116_143000_AddAllowedExportTypesToProfiles::class)]
class AllowedExportFormatsMigrationTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith([''])]
    #[TestWith(['craft_'])]
    public function testUpgradePreservesExistingProfilesWithOrWithoutATablePrefix(string $prefix): void
    {
        config(['database.connections.testing.prefix' => $prefix]);
        $db = new class(['dsn' => 'sqlite::memory:', 'tablePrefix' => $prefix]) extends Connection {
            public function columnExists(string $table, string $column, ?bool $refresh = null): bool
            {
                // This isolated database has no Craft info table or installed-site state.
                return parent::columnExists($table, $column, true);
            }
        };
        $previousCraft = \Craft::$app;
        $previousYii = \Yii::$app;
        \Craft::$app = \Yii::$app = new class($db) {
            public function __construct(private Connection $db) {}

            public function get(string $id, bool $throwException = true): mixed
            {
                return null;
            }

            public function getDb(): Connection
            {
                return $this->db;
            }

            public function getIsInstalled(): bool
            {
                return false;
            }
        };
        $db->createCommand()->createTable(ExportProfileRecord::TABLE, ['id' => 'integer PRIMARY KEY', 'name' => 'text', 'statuses' => 'text'])->execute();
        $db->createCommand()->insert(ExportProfileRecord::TABLE, ['id' => 7, 'name' => 'Existing export', 'statuses' => '*'])->execute();
        $migration = new m261116_143000_AddAllowedExportTypesToProfiles(['db' => $db]);
        ob_start();

        try {
            self::assertTrue($migration->up());
            self::assertTrue($migration->up());
            self::assertTrue($db->columnExists(ExportProfileRecord::TABLE, 'allowedExportTypes'));
            $row = $db->createCommand('SELECT * FROM {{%freeform_export_profiles}} WHERE id = 7')->queryOne();
            self::assertNull($row['allowedExportTypes']);
            self::assertSame('Existing export', $row['name']);
            self::assertSame('*', $row['statuses']);
            $db->createCommand()->update(ExportProfileRecord::TABLE, ['allowedExportTypes' => '["csv"]'], ['id' => 7])->execute();
            self::assertTrue($migration->up());
            self::assertSame('["csv"]', $db->createCommand('SELECT allowedExportTypes FROM {{%freeform_export_profiles}} WHERE id = 7')->queryScalar());
        } finally {
            ob_end_clean();
            $db->close();
            \Craft::$app = $previousCraft;
            \Yii::$app = $previousYii;
        }
    }
}
