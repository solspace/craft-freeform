<?php

namespace Solspace\Freeform\Tests\Bundles\Navigation;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Navigation\NavigationBundle;
use Solspace\Freeform\Events\Freeform\RegisterCpSubnavItemsEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\SettingsService;

#[CoversNothing]
class NavigationBundleTest extends TestCase
{
    #[TestWith(['activity', [Freeform::PERMISSION_SETTINGS_ACCESS], true])]
    #[TestWith(['activity', [Freeform::PERMISSION_ACTIVITY_ACCESS], true])]
    #[TestWith(['activity', [], false])]
    #[TestWith(['classic', [Freeform::PERMISSION_SETTINGS_ACCESS], false])]
    #[TestWith(['classic', [Freeform::PERMISSION_ACTIVITY_ACCESS], false])]
    #[TestWith(['none', [Freeform::PERMISSION_SETTINGS_ACCESS], false])]
    #[TestWith(['none', [Freeform::PERMISSION_ACTIVITY_ACCESS], false])]
    #[TestWith(['activity', [Freeform::PERMISSION_ACTIVITY_ACCESS], false, false])]
    public function testActivityNavRequiresActiveRecordingAndPermission(string $style, array $permissions, bool $visible, bool $enabled = true): void
    {
        $previousApp = \Craft::$app;
        \Craft::$app = new class {
            public object $request;

            public function __construct()
            {
                $this->request = new class {
                    public function getIsConsoleRequest(): bool
                    {
                        return true;
                    }
                };
            }

            public function getUser(): object
            {
                return new class {
                    public function getIsAdmin(): bool
                    {
                        return false;
                    }
                };
            }
        };

        try {
            $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
            $settings->loggingStyle = $style;
            $settings->activityEnabled = $enabled ? '1' : '0';
            $service = $this->createStub(SettingsService::class);
            $service->method('getSettingsModel')->willReturn($settings);
            $service->method('isSpamFolderEnabled')->willReturn(false);
            $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
            $plugin->method('__get')->with('settings')->willReturn($service);
            $bundle = $this->getMockBuilder(NavigationBundle::class)->disableOriginalConstructor()->onlyMethods(['plugin'])->getMock();
            $bundle->method('plugin')->willReturn($plugin);
            $event = new RegisterCpSubnavItemsEvent([], []);
            PermissionHelper::asAuthenticatedUser(static fn () => $bundle->registerNavigationItems($event), array_map('strtolower', $permissions));
            self::assertSame($visible, isset($event->getSubnavItems()['activity']));
            if ($visible) {
                self::assertSame('freeform/activity', $event->getSubnavItems()['activity']['url']);
            }
        } finally {
            \Craft::$app = $previousApp;
        }
    }
}
