<?php

namespace Solspace\Freeform\Tests\Controllers;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\api\ActivityAlertsController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\SettingsService;

#[CoversClass(ActivityAlertsController::class)]
class ActivityAlertsControllerTest extends TestCase
{
    #[TestWith(['activity', ['settings'], 'activity', 7])]
    #[TestWith(['activity', ['activity'], 'activity', 7])]
    #[TestWith(['activity', [], null, 0])]
    #[TestWith(['none', ['settings'], null, 0])]
    #[TestWith(['activity', ['settings'], null, 0, false])]
    #[TestWith(['activity', ['settings'], 'activity', 7, true, 1])]
    #[TestWith(['activity', ['settings'], 'activity', 7, true, 7])]
    #[TestWith(['activity', ['settings'], 'activity', 7, true, 90])]
    #[TestWith(['activity', ['settings'], 'activity', 7, true, 365])]
    #[TestWith(['activity', ['settings'], 'activity', 7, true, 0])]
    #[TestWith(['activity', ['settings'], 'activity', 7, true, 400])]
    public function testErrorsFollowAccessibleSelectedLog(
        string $style,
        array $access,
        ?string $expectedLog,
        int $expectedErrors,
        bool $activityEnabled = true,
        int $retentionDays = 30,
    ): void {
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
            $settings->activityEnabled = $activityEnabled ? '1' : '0';
            $settings->activityRetentionDays = $retentionDays;
            $settingsService = $this->createMock(SettingsService::class);
            $settingsService->method('getSettingsModel')->willReturn($settings);
            $activity = $this->createMock(ActivityService::class);
            $activity->expects('activity' === $expectedLog ? self::once() : self::never())->method('getErrorCount')->willReturn(7);
            $activity->expects('activity' === $expectedLog ? self::once() : self::never())->method('getOperationalWarningCount')->willReturn(2);

            $reflection = new \ReflectionClass(ActivityAlertsController::class);
            $controller = $reflection->newInstanceWithoutConstructor();
            foreach (['activityService' => $activity, 'settingsService' => $settingsService] as $name => $service) {
                $reflection->getProperty($name)->setValue($controller, $service);
            }
            $permissions = array_map(static fn ($permission) => strtolower('settings' === $permission ? Freeform::PERMISSION_SETTINGS_ACCESS : Freeform::PERMISSION_ACTIVITY_ACCESS), $access);
            $response = PermissionHelper::asAuthenticatedUser(static fn () => $reflection->getMethod('get')->invoke($controller), $permissions);

            self::assertSame(['errors' => $expectedErrors, 'errorLog' => $expectedLog, 'activityRetentionDays' => 'activity' === $expectedLog ? max(1, min(365, $retentionDays)) : null, 'warningLogs' => match ($expectedLog) {
                'activity' => [['log' => 'activity', 'count' => 2]],
                default => [],
            }], $response);
        } finally {
            \Craft::$app = $previousApp;
        }
    }
}
