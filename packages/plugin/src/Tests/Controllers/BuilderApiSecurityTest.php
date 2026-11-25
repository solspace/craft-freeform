<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\api\OptionsController;
use Solspace\Freeform\controllers\api\templates\NotificationsController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use yii\web\HttpException;

#[CoversClass(OptionsController::class)]
#[CoversClass(NotificationsController::class)]
#[CoversClass(PermissionHelper::class)]
class BuilderApiSecurityTest extends TestCase
{
    #[TestWith([OptionsController::class, 'actionGenerateOptions', false, 400])]
    #[TestWith([NotificationsController::class, 'actionPreviewTemplate', false, 400])]
    #[TestWith([NotificationsController::class, 'actionSendTest', false, 400])]
    #[TestWith([OptionsController::class, 'actionGenerateOptions', true, 403])]
    #[TestWith([NotificationsController::class, 'actionPreviewTemplate', true, 403])]
    #[TestWith([NotificationsController::class, 'actionSendTest', true, 403])]
    public function testActionsRejectSiteRequestsAndUsersWithoutFormPermission(string $class, string $action, bool $cp, int $status): void
    {
        $request = $this->createStub(Request::class);
        $request->method('getIsCpRequest')->willReturn($cp);
        $request->method('getIsConsoleRequest')->willReturn(false);
        $request->method('getIsPost')->willReturn(true);
        $request->method('post')->willReturnMap([['formId', null, 42]]);

        // Simulate a user permitted to manage another form, but not this one.
        $previousApp = \Craft::$app;
        \Craft::$app = new class($request) {
            public function __construct(public Request $request) {}

            public function getUser(): object
            {
                return new class {
                    public function getIsAdmin(): bool
                    {
                        return false;
                    }

                    public function checkPermission(string $permission): bool
                    {
                        return strtolower(Freeform::PERMISSION_FORMS_ACCESS) === $permission;
                    }
                };
            }
        };

        $controller = (new \ReflectionClass($class))->newInstanceWithoutConstructor();
        $controller->request = $request;

        try {
            PermissionHelper::asAuthenticatedUser(
                static fn () => $controller->{$action}(),
                [strtolower(Freeform::PERMISSION_FORMS_MANAGE).':41'],
            );
            self::fail('Expected the request to be rejected before rendering or generating options.');
        } catch (HttpException $exception) {
            self::assertSame($status, $exception->statusCode);
        } finally {
            \Craft::$app = $previousApp;
        }
    }
}
