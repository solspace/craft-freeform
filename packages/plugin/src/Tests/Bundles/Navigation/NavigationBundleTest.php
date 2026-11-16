<?php

namespace Solspace\Freeform\Tests\Bundles\Navigation;

use CraftCms\Cms\Cp\Data\NavItem;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Navigation\NavigationBundle;
use Solspace\Freeform\Events\Freeform\RegisterCpSubnavItemsEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversNothing]
class NavigationBundleTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith(['freeform/export/profiles', true])]
    #[TestWith(['freeform/export/notifications/new', true])]
    #[TestWith(['freeform/export/forms', true])]
    #[TestWith(['freeform/import/forms', true])]
    #[TestWith(['freeform/import/formie/v3', true])]
    #[TestWith(['freeform/notifications', false])]
    #[TestWith(['freeform/import/express-forms', true, true, ['express-forms']])]
    #[TestWith(['freeform/import/formie/v3', true, true, ['formie']])]
    #[TestWith(['freeform/import/forms', true, true, []])]
    public function testImportExportParentRemainsSelectedAcrossItsPages(string $path, bool $selected, bool $utility = false, array $installedPlugins = []): void
    {
        $previousApp = \Craft::$app;
        \Craft::$app = new class($path, $installedPlugins) {
            public object $request;

            public function __construct(private string $path, private array $installedPlugins)
            {
                $this->request = $this->getRequest();
            }

            public function getRequest(): object
            {
                return new class($this->path) {
                    public function __construct(private string $path) {}

                    public function getPathInfo(): string
                    {
                        return $this->path;
                    }

                    public function getFullPath(): string
                    {
                        return 'admin/'.$this->path;
                    }

                    public function getIsConsoleRequest(): bool
                    {
                        return true;
                    }
                };
            }

            public function getPlugins(): object
            {
                return new class($this->installedPlugins) {
                    public function __construct(private array $handles) {}

                    public function isPluginInstalled(string $handle): bool
                    {
                        return \in_array($handle, $this->handles, true);
                    }

                    public function isPluginEnabled(string $handle): bool
                    {
                        return $this->isPluginInstalled($handle);
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
            $settings->loggingStyle = 'none';
            $service = $this->createStub(SettingsService::class);
            $service->method('getSettingsModel')->willReturn($settings);
            $service->method('isSpamFolderEnabled')->willReturn(false);
            $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
            app()->instance(Freeform::class, $plugin);
            $plugin->method('__get')->with('settings')->willReturn($service);
            $bundle = $this->getMockBuilder(NavigationBundle::class)->disableOriginalConstructor()->onlyMethods(['plugin'])->getMock();
            $bundle->method('plugin')->willReturn($plugin);
            $event = new RegisterCpSubnavItemsEvent(new NavItem(['id' => 'freeform', 'label' => 'Freeform']), []);
            PermissionHelper::asAuthenticatedUser(
                static fn () => $bundle->registerNavigationItems($event),
                array_map(strtolower(...), $utility ? [Freeform::PERMISSION_EXPORT_PROFILES_ACCESS, Freeform::PERMISSION_EXPORT_DATA_UTILITY_ACCESS] : [Freeform::PERMISSION_EXPORT_PROFILES_ACCESS]),
            );
            self::assertSame($selected, $event->getSubnavItems()['export']['sel']);
            self::assertSame('freeform/export/profiles', $event->getSubnavItems()['export']['url']);
            foreach (['express-forms', 'formie'] as $handle) {
                self::assertSame($utility && \in_array($handle, $installedPlugins, true), isset($event->getSubnavItems()['export']['subnav']['import-'.$handle]));
            }
        } finally {
            \Craft::$app = $previousApp;
        }
    }

    #[TestWith(['activity', [Freeform::PERMISSION_SETTINGS_ACCESS], true])]
    #[TestWith(['activity', [Freeform::PERMISSION_ACTIVITY_ACCESS], true])]
    #[TestWith(['activity', [], false])]
    #[TestWith(['classic', [Freeform::PERMISSION_SETTINGS_ACCESS], false])]
    #[TestWith(['classic', [Freeform::PERMISSION_ACTIVITY_ACCESS], false])]
    #[TestWith(['none', [Freeform::PERMISSION_SETTINGS_ACCESS], false])]
    #[TestWith(['none', [Freeform::PERMISSION_ACTIVITY_ACCESS], false])]
    #[TestWith(['activity', [Freeform::PERMISSION_ACTIVITY_ACCESS], false, false])]
    #[TestWith(['activity', [Freeform::PERMISSION_ACTIVITY_ACCESS], true, true, 3, 2])]
    #[TestWith(['activity', [Freeform::PERMISSION_SETTINGS_ACCESS], true, true, 0, 2])]
    #[TestWith(['activity', [Freeform::PERMISSION_ACTIVITY_ACCESS], true, true, 3, 0])]
    #[TestWith(['activity', [Freeform::PERMISSION_ACTIVITY_ACCESS], true, true, 3, 2, ''])]
    #[TestWith(['activity', [Freeform::PERMISSION_ACTIVITY_ACCESS], true, true, 3, 2, 'submissions'])]
    public function testActivityNavRequiresActiveRecordingAndPermission(string $style, array $permissions, bool $visible, bool $enabled = true, int $errors = 0, int $warnings = 0, string $badgeType = 'all'): void
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

                    public function getPathInfo(): string
                    {
                        return 'freeform/settings/general';
                    }
                };
            }

            public function getRequest(): object
            {
                return $this->request;
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
            $settings->badgeType = $badgeType;
            $activity = $this->createMock(ActivityService::class);
            $activity->expects($visible ? self::once() : self::never())->method('getErrorCount')->willReturn($errors);
            $activity->expects($visible ? self::once() : self::never())->method('getOperationalWarningCount')->willReturn($warnings);
            $service = $this->createStub(SettingsService::class);
            $service->method('getSettingsModel')->willReturn($settings);
            $service->method('isSpamFolderEnabled')->willReturn(false);
            $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
            app()->instance(Freeform::class, $plugin);
            $plugin->method('__get')->willReturnMap([['settings', $service], ['activity', $activity]]);
            $bundle = $this->getMockBuilder(NavigationBundle::class)->disableOriginalConstructor()->onlyMethods(['plugin'])->getMock();
            $bundle->method('plugin')->willReturn($plugin);
            $event = new RegisterCpSubnavItemsEvent(new NavItem(['id' => 'freeform', 'label' => 'Freeform']), []);
            PermissionHelper::asAuthenticatedUser(static fn () => $bundle->registerNavigationItems($event), array_map('strtolower', $permissions));
            self::assertSame($visible, isset($event->getSubnavItems()['activity']));
            if ($visible) {
                self::assertSame('freeform/activity', $event->getSubnavItems()['activity']['url']);
                self::assertSame(($errors + $warnings) ?: null, $event->getSubnavItems()['activity']['badgeCount']);
            }
        } finally {
            \Craft::$app = $previousApp;
        }
    }
}
