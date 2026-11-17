<?php

namespace Solspace\Freeform\Tests\Migrations;

use craft\services\ProjectConfig;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Configuration\QueueProcessingUpgrade;
use Solspace\Freeform\migrations\m261116_190000_CombineQueueProcessing;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversNothing]
class CombineQueueProcessingTest extends TestCase
{
    use UsesCraft6Container;

    public function testEveryLegacyCombinationAndRepeatedUpgradePreserveTheCombinedChoice(): void
    {
        for ($bits = 0; $bits < 8; ++$bits) {
            $settings = ['pluginName' => 'Preserve me', 'queuePriority' => 512];
            foreach (QueueProcessingUpgrade::LEGACY_KEYS as $i => $key) {
                $settings[$key] = ($bits & (1 << $i)) ? 'true' : 'false';
            }
            $updated = QueueProcessingUpgrade::settings($settings);
            self::assertSame(0 === $bits ? 'false' : 'true', $updated['useQueue']);
            self::assertSame('Preserve me', $updated['pluginName']);
            self::assertSame(512, $updated['queuePriority']);
            foreach (QueueProcessingUpgrade::LEGACY_KEYS as $key) {
                self::assertArrayNotHasKey($key, $updated);
            }
            self::assertSame($updated, QueueProcessingUpgrade::settings($updated));
        }
    }

    public function testExplicitNewChoiceWinsAndEnvironmentReferencesRemainDynamic(): void
    {
        self::assertSame(['useQueue' => 'false'], QueueProcessingUpgrade::settings(['useQueue' => 'false', 'useQueueForAiFields' => 'true']));
        self::assertSame(['useQueue' => '$BACKGROUND'], QueueProcessingUpgrade::settings(['useQueueForAiFields' => '$BACKGROUND', 'useQueueForIntegrations' => 'false']));
        $updated = QueueProcessingUpgrade::settings(['useQueueForAiFields' => '$AI_QUEUE', 'useQueueForIntegrations' => '$CRM_QUEUE']);
        self::assertSame(['useQueue' => ['$AI_QUEUE', '$CRM_QUEUE']], $updated);
        $settings = new Settings($updated);
        $before = $_SERVER;

        try {
            $_SERVER['AI_QUEUE'] = 'false';
            $_SERVER['CRM_QUEUE'] = 'false';
            self::assertFalse($settings->isQueueEnabled());
            $_SERVER['AI_QUEUE'] = 'true';
            self::assertTrue($settings->isQueueEnabled());
            $_SERVER['AI_QUEUE'] = 'false';
            $_SERVER['CRM_QUEUE'] = 'true';
            self::assertTrue($settings->isQueueEnabled());
        } finally {
            $_SERVER = $before;
        }
    }

    #[TestWith([false, '6.0.3'])]
    #[TestWith([true, '6.0.3'])]
    #[TestWith([false, '6.0.4'])]
    public function testMigrationSupportsReadOnlyDeploymentsAndDoesNotClobberNewerConfig(bool $readOnly, string $schema): void
    {
        $stored = ['useQueueForAiFields' => 'true', 'useQueueForEmailNotifications' => 'false', 'queuePriority' => 2048];
        $config = $this->getMockBuilder(ProjectConfig::class)->disableOriginalConstructor()->onlyMethods(['get', 'set'])->getMock();
        $config->readOnly = $readOnly;
        $config->method('get')->willReturnCallback(static fn ($path, $external = false) => $external ? $schema : $stored);
        $writable = !$readOnly && version_compare($schema, '6.0.4', '<');
        $written = null;
        $config->expects($writable ? self::once() : self::never())->method('set')->willReturnCallback(static function ($path, $value) use (&$written) {
            self::assertSame('plugins.freeform.settings', $path);
            $written = $value;

            return true;
        });
        $before = \Craft::$app;
        \Craft::$app = (object) ['projectConfig' => $config];

        try {
            $migration = (new \ReflectionClass(m261116_190000_CombineQueueProcessing::class))->newInstanceWithoutConstructor();
            self::assertTrue($migration->safeUp());
            $effective = new Settings($written ?? $stored);
            self::assertTrue($effective->isQueueEnabled());
            self::assertSame(2048, $effective->queuePriority);
            self::assertArrayNotHasKey('useQueueForAiFields', $effective->toArray());
        } finally {
            \Craft::$app = $before;
        }
    }
}
