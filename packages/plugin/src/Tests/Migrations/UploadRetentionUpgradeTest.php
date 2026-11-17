<?php

namespace Solspace\Freeform\Tests\Migrations;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Configuration\UploadRetentionUpgrade;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversNothing]
class UploadRetentionUpgradeTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith([false, 180, 0])]
    #[TestWith([true, 180, 180])]
    #[TestWith([false, 1440, 0])]
    #[TestWith([true, 1440, 1440])]
    #[TestWith([true, 0, 0])]
    public function testBothOldSettingsBecomeOneIntervalWithoutEnablingDisabledCleanup(bool $enabled, int $interval, int $expected): void
    {
        $original = ['purgeAssets' => $enabled, 'purgableUnfinalizedAssetAgeInMinutes' => $interval, 'pluginName' => 'Custom'];
        $updated = UploadRetentionUpgrade::settings($original);
        self::assertSame($expected, $updated['purgableUnfinalizedAssetAgeInMinutes']);
        self::assertArrayNotHasKey('purgeAssets', $updated);
        self::assertSame($updated, UploadRetentionUpgrade::settings($updated));
        $settings = new Settings($original);
        self::assertSame($expected, $settings->purgableUnfinalizedAssetAgeInMinutes);
        $service = $this->getMockBuilder(SettingsService::class)->onlyMethods(['getSettingsModel'])->getMock();
        $service->method('getSettingsModel')->willReturn($settings);
        self::assertSame(0 === $expected ? null : $expected, $service->getPurgableUnfinalizedAssetAgeInMinutes());
        self::assertSame('Custom', $settings->pluginName);
        self::assertArrayNotHasKey('purgeAssets', $settings->toArray());
    }

    public function testDefaultRemainsThreeHoursAndNeverSurvivesReload(): void
    {
        self::assertSame(180, (new Settings())->purgableUnfinalizedAssetAgeInMinutes);
        self::assertSame(180, (new Settings(['purgeAssets' => true]))->purgableUnfinalizedAssetAgeInMinutes);
        $settings = new Settings(['purgableUnfinalizedAssetAgeInMinutes' => 0]);
        self::assertSame(0, (new Settings($settings->toArray()))->purgableUnfinalizedAssetAgeInMinutes);
    }
}
