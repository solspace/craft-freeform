<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Services\FormDashboardWidgetsService;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;

/**
 * @coversNothing
 */
#[CoversClass(FormDashboardWidgetsService::class)]
class FormDashboardWidgetsServiceTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousYiiApp;
    private object $preferences;
    private FormDashboardWidgetsService $service;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $this->preferences = new class {
            public array $values = ['freeform.dashboardWidgets.2' => [
                ['uid' => 'one', 'type' => 'linear', 'size' => '2x2', 'groupUid' => null, 'beforeId' => null, 'settings' => ['title' => 'Keep my settings']],
                ['uid' => 'two', 'type' => 'recent', 'size' => '1x2', 'groupUid' => null, 'beforeId' => null, 'settings' => ['limit' => 3]],
            ]];

            public function saveUserPreferences($user, $values): void
            {
                $this->values = array_replace($this->values, $values);
            }
        };
        $user = new class($this->preferences) {
            public bool $allowAccess = false;

            public function __construct(private object $preferences) {}

            public function getPreference($key): mixed
            {
                return $this->preferences->values[$key] ?? null;
            }

            public function getIdentity(): object
            {
                return $this;
            }

            public function getIsAdmin(): bool
            {
                return false;
            }

            public function checkPermission($name): bool
            {
                return $this->allowAccess && strtolower(Freeform::PERMISSION_FORMS_ACCESS) === $name;
            }

            public function getId(): int
            {
                return 7;
            }
        };
        $mutex = new class {
            public function acquire($name, $timeout): bool
            {
                return true;
            }

            public function release($name): void {}
        };
        \Craft::$app = \Yii::$app = new class($user, $mutex, $this->preferences) {
            public array $loadedModules = [];
            public object $request;

            public function __construct(private object $user, private object $mutex, private object $preferences)
            {
                $this->request = new class {
                    public function getIsConsoleRequest(): bool
                    {
                        return false;
                    }
                };
            }

            public function getUser(): object
            {
                return $this->user;
            }

            public function getUsers(): object
            {
                return $this->preferences;
            }

            public function getMutex(): object
            {
                return $this->mutex;
            }
        };
        $this->service = $this->getMockBuilder(FormDashboardWidgetsService::class)->onlyMethods(['getGroups'])->getMock();
        $this->service->method('getGroups')->willReturn([(object) ['uid' => 'group']]);
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
    }

    public function testReordersAndResizesWithoutOverwritingSettingsOrNewerWidgets(): void
    {
        $result = $this->service->updateLayout(2, [['uid' => 'two', 'size' => '2x1', 'groupUid' => 'group', 'beforeId' => 8, 'settings' => ['limit' => 99]]]);
        self::assertSame(['two', 'one'], array_column($result, 'uid'));
        self::assertSame(['limit' => 3], $result[0]['settings']);
        self::assertSame('2x1', $result[0]['size']);
        self::assertSame(8, $result[0]['beforeId']);
        self::assertSame(['title' => 'Keep my settings'], $result[1]['settings']);
        self::assertSame($result, $this->preferences->values['freeform.dashboardWidgets.2']);
    }

    #[TestWith(['size', '4x4'])]
    #[TestWith(['size', []])]
    #[TestWith(['groupUid', 'another-site-group'])]
    #[TestWith(['beforeId', -1])]
    #[TestWith(['beforeId', '8'])]
    #[TestWith(['uid', 'another-users-widget'])]
    public function testRejectsInvalidOrUnownedPlacements(string $key, mixed $value): void
    {
        $previous = $this->preferences->values;

        try {
            $this->service->updateLayout(2, [array_replace(['uid' => 'one', 'size' => '2x2', 'groupUid' => null, 'beforeId' => null], [$key => $value])]);
            self::fail('Expected layout validation to fail');
        } catch (BadRequestHttpException) {
            self::assertSame($previous, $this->preferences->values);
        }
    }

    #[TestWith(['linear', '3x3'])]
    #[TestWith(['recent', '3x3'])]
    #[TestWith(['radial', '3x3'])]
    #[TestWith(['quick-form', '3x3'])]
    #[TestWith(['linear', '3x2'])]
    #[TestWith(['recent', '3x2'])]
    #[TestWith(['recent', '2x3'])]
    #[TestWith(['radial', '2x3'])]
    #[TestWith(['quick-form', '2x3'])]
    public function testSupportedExtraSizesPersistWithoutChangingSettings(string $type, string $size): void
    {
        $this->preferences->values['freeform.dashboardWidgets.2'][0]['type'] = $type;
        $result = $this->service->updateLayout(2, [['uid' => 'one', 'size' => $size, 'groupUid' => 'group', 'beforeId' => null]]);
        self::assertSame($size, $result[0]['size']);
        self::assertSame(['title' => 'Keep my settings'], $result[0]['settings']);
        self::assertSame($size, $this->service->getItem(2, 'one')['size']);
    }

    #[TestWith(['linear', '2x3', 'recent'])]
    #[TestWith(['radial', '3x2', 'linear'])]
    #[TestWith(['quick-form', '3x2', 'recent'])]
    public function testUnsupportedSizesCannotBeEnabledBySpoofingTheWidgetType(string $type, string $size, string $spoofedType): void
    {
        $this->preferences->values['freeform.dashboardWidgets.2'][0]['type'] = $type;
        $previous = $this->preferences->values;

        try {
            $this->service->updateLayout(2, [['uid' => 'one', 'size' => $size, 'type' => $spoofedType, 'groupUid' => null, 'beforeId' => null]]);
            self::fail('Expected unsupported widget size to be rejected.');
        } catch (BadRequestHttpException) {
            self::assertSame($previous, $this->preferences->values);
        }
    }

    public function testAnInvalidSizeRejectsTheWholeLayoutWithoutSavingEarlierChanges(): void
    {
        $previous = $this->preferences->values;

        try {
            $this->service->updateLayout(2, [
                ['uid' => 'one', 'size' => '3x2', 'groupUid' => null, 'beforeId' => null],
                ['uid' => 'two', 'size' => '4x4', 'groupUid' => null, 'beforeId' => null],
            ]);
            self::fail('Expected invalid size to be rejected.');
        } catch (BadRequestHttpException) {
            self::assertSame($previous, $this->preferences->values);
        }
    }

    public function testCannotRemoveAWidgetFromAnotherSite(): void
    {
        $this->expectException(NotFoundHttpException::class);
        $this->service->remove(3, 'one');
    }

    public function testRemovesOnlyTheRequestedPersonalWidget(): void
    {
        self::assertSame(['two'], array_column($this->service->remove(2, 'one'), 'uid'));
    }

    public function testRequiresFormsDashboardPermission(): void
    {
        $this->expectException(ForbiddenHttpException::class);
        $this->service->requireAccess(2);
    }

    #[TestWith(['lite'])]
    #[TestWith(['express'])]
    public function testDowngradeDeniesWidgetAccessAndRetainsSavedWidgetSettings(string $edition): void
    {
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods([])->getMock();
        $plugin->edition = $edition;
        \Yii::$app->loadedModules = [Freeform::class => $plugin];
        $saved = $this->preferences->values;
        \Craft::$app->getUser()->allowAccess = true;

        try {
            PermissionHelper::asAuthenticatedUser(fn () => $this->service->requireAccess(2), [strtolower(Freeform::PERMISSION_FORMS_ACCESS)]);
            self::fail('Expected widgets to require Pro.');
        } catch (ForbiddenHttpException) {
            self::assertSame($saved, $this->preferences->values);
            self::assertSame($saved['freeform.dashboardWidgets.2'], $this->service->getItems(2));
        }
    }

    public function testRejectsUnregisteredWidgetClasses(): void
    {
        $this->expectException(BadRequestHttpException::class);
        $this->service->createWidget(2, ['type' => '\craft\widgets\Feed', 'settings' => []]);
    }
}
