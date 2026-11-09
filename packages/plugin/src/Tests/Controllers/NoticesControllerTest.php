<?php

namespace Solspace\Freeform\Tests\Controllers;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\api\NoticesController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\FreeformFeedService;
use Solspace\Freeform\Services\LoggerService;
use Solspace\Freeform\Services\SettingsService;

#[CoversClass(NoticesController::class)]
class NoticesControllerTest extends TestCase
{
    #[TestWith(['activity', true, false, ['settings'], 'activity', 7])]
    #[TestWith(['activity', false, false, ['activity'], 'activity', 7])]
    #[TestWith(['activity', true, false, [], null, 0])]
    #[TestWith(['classic', true, true, ['settings'], 'classic', 3])]
    #[TestWith(['classic', true, false, ['settings'], 'classic', 3])]
    #[TestWith(['classic', true, false, ['activity'], null, 0])]
    #[TestWith(['none', true, false, ['settings'], null, 0])]
    #[TestWith(['activity', false, false, ['settings'], null, 0, false])]
    #[TestWith(['classic', true, false, ['settings'], null, 0, true, false])]
    #[TestWith(['activity', true, false, ['settings'], 'activity', 7, true, true, 1])]
    #[TestWith(['activity', true, false, ['settings'], 'activity', 7, true, true, 7])]
    #[TestWith(['activity', true, false, ['settings'], 'activity', 7, true, true, 90])]
    #[TestWith(['activity', true, false, ['settings'], 'activity', 7, true, true, 365])]
    #[TestWith(['activity', true, false, ['settings'], 'activity', 7, true, true, 0])]
    #[TestWith(['activity', true, false, ['settings'], 'activity', 7, true, true, 400])]
    public function testErrorsFollowAccessibleSelectedLogIndependentlyOfFeed(
        string $style,
        bool $classicPreference,
        bool $feedEnabled,
        array $access,
        ?string $expectedLog,
        int $expectedErrors,
        bool $activityEnabled = true,
        bool $classicEnabled = true,
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
            $settings->technicalFileLogging = $classicPreference && $classicEnabled ? '1' : '0';
            $settings->activityEnabled = $activityEnabled ? '1' : '0';
            $settings->activityRetentionDays = $retentionDays;
            $settingsService = $this->createMock(SettingsService::class);
            $settingsService->method('getSettingsModel')->willReturn($settings);
            $settingsService->method('isDisplayFeed')->willReturn($feedEnabled);
            $feed = $this->createMock(FreeformFeedService::class);
            $feed->expects($feedEnabled ? self::once() : self::never())->method('getUnreadFeedMessages')->willReturn([]);
            $logger = $this->createMock(LoggerService::class);
            $logger->expects('classic' === $expectedLog ? self::once() : self::never())->method('getErrorLogLineCount')->willReturn(3);
            $logger->expects('classic' === $expectedLog ? self::once() : self::never())->method('getWarningLogCounts')->willReturn(['integrations-log' => 2, 'email-log' => 1]);
            $activity = $this->createMock(ActivityService::class);
            $activity->expects('activity' === $expectedLog ? self::once() : self::never())->method('getErrorCount')->willReturn(7);
            $activity->expects('activity' === $expectedLog ? self::once() : self::never())->method('getOperationalWarningCount')->willReturn(2);

            $reflection = new \ReflectionClass(NoticesController::class);
            $controller = $reflection->newInstanceWithoutConstructor();
            foreach (['feedService' => $feed, 'loggerService' => $logger, 'activityService' => $activity, 'settingsService' => $settingsService] as $name => $service) {
                $reflection->getProperty($name)->setValue($controller, $service);
            }
            $permissions = array_map(static fn ($permission) => strtolower('settings' === $permission ? Freeform::PERMISSION_SETTINGS_ACCESS : Freeform::PERMISSION_ACTIVITY_ACCESS), $access);
            $response = PermissionHelper::asAuthenticatedUser(static fn () => $reflection->getMethod('get')->invoke($controller), $permissions);

            self::assertSame(['notices' => [], 'errors' => $expectedErrors, 'errorLog' => $expectedLog, 'activityRetentionDays' => 'activity' === $expectedLog ? max(1, min(365, $retentionDays)) : null, 'warningLogs' => match ($expectedLog) {
                'activity' => [['log' => 'activity', 'count' => 2]],
                'classic' => [['log' => 'integrations-log', 'count' => 2], ['log' => 'email-log', 'count' => 1]],
                default => [],
            }], $response);
        } finally {
            \Craft::$app = $previousApp;
        }
    }
}
