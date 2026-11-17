<?php

namespace Solspace\Freeform\Tests\Migrations;

use craft\services\ProjectConfig;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\migrations\m261116_170000_RemoveRetiredSettings;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversClass(m261116_170000_RemoveRetiredSettings::class)]
class RemoveRetiredSettingsTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith(['classic', false, '5.18.4', 'activity'])]
    #[TestWith(['classic', false, null, 'activity'])]
    #[TestWith(['classic', true, '5.18.4', 'classic'])]
    #[TestWith(['classic', false, '6.0.0', 'classic'])]
    #[TestWith(['activity', false, '5.18.4', 'activity'])]
    #[TestWith(['none', false, '5.18.4', 'none'])]
    public function testUpgradeNormalizesWritableSettingsAndRemovesOnlyRetiredFiles(string $style, bool $readOnly, ?string $incomingSchema, string $storedStyle): void
    {
        $previousApp = \Craft::$app;
        $path = sys_get_temp_dir().'/freeform-retire-logs-'.bin2hex(random_bytes(6));
        mkdir($path);
        $retired = ['freeform.log', 'freeform-email.log', 'freeform-integrations.log'];
        foreach ([...$retired, 'web.log', 'other-plugin.log'] as $file) {
            file_put_contents($path.'/'.$file, 'Existing log');
        }
        $stored = ['rememberPageSubmitOrder' => 'false', 'autoScroll' => 'false', 'autoScrollToErrors' => 'true', 'sessionContextSecret' => 'preserve-existing-key', 'scriptInsertType' => 'inline', 'scriptInsertLocation' => 'header', 'loggingStyle' => $style, 'activityEnabled' => 'false', 'technicalFileLogging' => 'false', 'loggingLevel' => 'debug', 'activityMode' => 'custom', 'activityEvents' => ['submission' => false], 'activityRetentionDays' => 7, 'pluginName' => 'Custom name'];
        $original = $stored;
        // get() must see updates for an idempotent second migration run.
        $config = $this->getMockBuilder(ProjectConfig::class)->disableOriginalConstructor()->onlyMethods(['get', 'set'])->getMock();
        $config->readOnly = $readOnly;
        $config->method('get')->willReturnCallback(static function ($key, $external = false) use (&$stored, $incomingSchema) {
            return $external ? $incomingSchema : $stored;
        });
        $config->expects(!$readOnly && (null === $incomingSchema || version_compare($incomingSchema, '6.0.0', '<')) ? self::once() : self::never())->method('set')->willReturnCallback(static function ($key, $value) use (&$stored) {
            self::assertSame('plugins.freeform.settings', $key);
            $stored = $value;

            return true;
        });
        \Craft::$app = new class($config, $path) {
            public object $path;

            public function __construct(public ProjectConfig $projectConfig, string $path)
            {
                $this->path = new class($path) {
                    public function __construct(private string $path) {}

                    public function getLogPath(): string
                    {
                        return $this->path;
                    }
                };
            }
        };

        try {
            $migration = (new \ReflectionClass(m261116_170000_RemoveRetiredSettings::class))->newInstanceWithoutConstructor();
            self::assertTrue($migration->safeUp());
            self::assertTrue($migration->safeUp());
            self::assertSame($storedStyle, $stored['loggingStyle']);
            if ($readOnly || '6.0.0' === $incomingSchema) {
                self::assertSame($original, $stored);
            } else {
                self::assertArrayNotHasKey('technicalFileLogging', $stored);
                self::assertArrayNotHasKey('loggingLevel', $stored);
                self::assertArrayNotHasKey('scriptInsertType', $stored);
                self::assertSame('footer', $stored['scriptInsertLocation']);
            }
            $effective = Settings::normalizeLegacySettings($stored);
            self::assertSame('footer', $effective['scriptInsertLocation']);
            self::assertArrayNotHasKey('scriptInsertType', $effective);
            self::assertArrayNotHasKey('autoScroll', $effective);
            self::assertArrayNotHasKey('rememberPageSubmitOrder', $effective);
            self::assertSame('classic' === $style ? 'activity' : $style, $effective['loggingStyle']);
            self::assertSame('classic' === $style ? 'true' : 'false', $effective['activityEnabled']);
            foreach (['activityMode', 'activityEvents', 'activityRetentionDays', 'pluginName', 'autoScrollToErrors', 'sessionContextSecret'] as $key) {
                self::assertSame($original[$key], $effective[$key]);
            }
            foreach ($retired as $file) {
                self::assertFileDoesNotExist($path.'/'.$file);
            }
            self::assertSame('Existing log', file_get_contents($path.'/web.log'));
            self::assertSame('Existing log', file_get_contents($path.'/other-plugin.log'));
        } finally {
            foreach (glob($path.'/*') as $file) {
                unlink($file);
            }
            rmdir($path);
            \Craft::$app = $previousApp;
        }
    }
}
