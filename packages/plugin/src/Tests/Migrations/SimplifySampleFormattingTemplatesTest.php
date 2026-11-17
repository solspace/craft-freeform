<?php

namespace Solspace\Freeform\Tests\Migrations;

use craft\db\Connection;
use craft\services\ProjectConfig;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Templates\SampleTemplateUpgrade;
use Solspace\Freeform\migrations\m261116_180000_SimplifySampleFormattingTemplates;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

/**
 * @coversNothing
 */
class SimplifySampleFormattingTemplatesTest extends TestCase
{
    use UsesCraft6Container;

    #[DataProvider('templates')]
    public function testEachSelectionAndConfiguredDefaultUsesItsReplacement(string $old, string $new): void
    {
        $settings = [
            'formattingTemplate' => $old,
            'defaults' => ['settings' => ['general' => ['formattingTemplate' => ['value' => $old, 'locked' => true], 'submissionTitle' => ['value' => 'Keep this title']]]],
        ];
        $updated = Settings::normalizeLegacySettings($settings);
        self::assertSame($new, $updated['formattingTemplate']);
        self::assertSame(['value' => $new, 'locked' => true], $updated['defaults']['settings']['general']['formattingTemplate']);
        self::assertSame($settings['defaults']['settings']['general']['submissionTitle'], $updated['defaults']['settings']['general']['submissionTitle']);
        self::assertSame($updated, SampleTemplateUpgrade::settings($updated));
        self::assertFileExists(__DIR__.'/../../templates/_templates/formatting/'.$new);
        self::assertFileDoesNotExist(__DIR__.'/../../templates/_templates/formatting/'.$old);
    }

    public static function templates(): iterable
    {
        foreach (SampleTemplateUpgrade::REPLACEMENTS as $old => $new) {
            yield $old => [$old, $new];
        }
    }

    #[TestWith(['', false])]
    #[TestWith(['craft_', false])]
    #[TestWith(['craft_', true])]
    public function testMigrationPreservesOtherMetadataAndCustomOverridesAndIsIdempotent(string $prefix, bool $readOnly): void
    {
        config(['database.connections.testing.prefix' => $prefix]);
        $db = new Connection(['dsn' => 'sqlite::memory:', 'tablePrefix' => $prefix]);
        $previousCraft = \Craft::$app;
        $previousYii = \Yii::$app;
        $directory = sys_get_temp_dir().'/freeform-template-upgrade-'.bin2hex(random_bytes(5));
        mkdir($directory.'/basic-dark', 0777, true);
        file_put_contents($directory.'/basic-dark/index.twig', 'Custom template');
        $stored = ['formTemplateDirectory' => $directory, 'defaults' => ['settings' => ['general' => ['formattingTemplate' => ['value' => 'tailwind-3/index.twig', 'locked' => true]]]]];
        $projectConfig = $this->getMockBuilder(ProjectConfig::class)->disableOriginalConstructor()->onlyMethods(['get', 'set'])->getMock();
        $projectConfig->readOnly = $readOnly;
        $projectConfig->method('get')->willReturnCallback(static function ($path, $external = false) use (&$stored) {
            return $external ? '6.0.1' : $stored;
        });
        $projectConfig->expects($readOnly ? self::never() : self::once())->method('set')->willReturnCallback(static function ($path, $value) use (&$stored): bool {
            self::assertSame('plugins.freeform.settings', $path);
            $stored = $value;

            return true;
        });
        \Craft::$app = \Yii::$app = new class($db, $projectConfig) {
            public function __construct(private Connection $db, public ProjectConfig $projectConfig) {}

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
        $db->createCommand()->createTable(FormRecord::TABLE, ['id' => 'integer PRIMARY KEY', 'metadata' => 'text'])->execute();
        $rows = [];
        foreach (SampleTemplateUpgrade::REPLACEMENTS + ['custom/contact.twig' => 'custom/contact.twig', '' => ''] as $old => $new) {
            $metadata = ['general' => ['formattingTemplate' => $old, 'description' => $old, 'translations' => true], 'behavior' => ['ajax' => false]];
            $id = \count($rows) + 1;
            $db->createCommand()->insert(FormRecord::TABLE, ['id' => $id, 'metadata' => json_encode($metadata)])->execute();
            $rows[$id] = [$metadata, 'basic-dark/index.twig' === $old ? $old : $new];
        }
        ob_start();

        try {
            $migration = new m261116_180000_SimplifySampleFormattingTemplates(['db' => $db]);
            self::assertTrue($migration->up());
            self::assertTrue($migration->up());
            foreach ($rows as $id => [$metadata, $expected]) {
                $metadata['general']['formattingTemplate'] = $expected;
                $actual = json_decode($db->createCommand('SELECT metadata FROM {{%freeform_forms}} WHERE id = :id', [':id' => $id])->queryScalar(), true);
                self::assertSame($metadata, $actual);
            }
            self::assertSame($readOnly ? 'tailwind-3/index.twig' : 'tailwind-4-light/index.twig', $stored['defaults']['settings']['general']['formattingTemplate']['value']);
            self::assertTrue($stored['defaults']['settings']['general']['formattingTemplate']['locked']);
            self::assertSame('Custom template', file_get_contents($directory.'/basic-dark/index.twig'));
            self::assertSame('basic-dark/index.twig', SampleTemplateUpgrade::settings(['formTemplateDirectory' => $directory, 'formattingTemplate' => 'basic-dark/index.twig'])['formattingTemplate']);
            self::assertNull(SampleTemplateUpgrade::replace(null));
            self::assertSame('$FORM_TEMPLATE', SampleTemplateUpgrade::replace('$FORM_TEMPLATE'));
        } finally {
            ob_end_clean();
            $db->close();
            \Craft::$app = $previousCraft;
            \Yii::$app = $previousYii;
            unlink($directory.'/basic-dark/index.twig');
            rmdir($directory.'/basic-dark');
            rmdir($directory);
        }
    }
}
