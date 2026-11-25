<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\web\Request;
use craft\web\User;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\api\AutosuggestController;
use Solspace\Freeform\controllers\api\fields\GroupsController;
use Solspace\Freeform\controllers\api\forms\LayoutController;
use Solspace\Freeform\controllers\BaseCpApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Services\FormsService;
use yii\base\Action;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;

#[CoversClass(BaseCpApiController::class)]
#[CoversClass(GroupsController::class)]
#[CoversClass(LayoutController::class)]
class ControlPanelApiPermissionsTest extends TestCase
{
    private mixed $previousApp;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
    }

    public function testSiteRequestIsRejectedBeforeActionRuns(): void
    {
        $request = $this->configureApp(false, ['accessCp', 'accessPlugin-freeform']);
        $controller = (new \ReflectionClass(AutosuggestController::class))->newInstanceWithoutConstructor();
        $controller->request = $request;

        $this->expectException(BadRequestHttpException::class);
        $controller->beforeAction(new Action('env', $controller));
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testControlPanelRequiresFreeformSectionAccess(bool $hasFreeformAccess): void
    {
        $permissions = $hasFreeformAccess ? ['accessCp', 'accessPlugin-freeform'] : ['accessCp'];
        $request = $this->configureApp(true, $permissions);
        $controller = (new \ReflectionClass(AutosuggestController::class))->newInstanceWithoutConstructor();
        $controller->request = $request;
        $controller->enableCsrfValidation = false;

        if (!$hasFreeformAccess) {
            $this->expectException(ForbiddenHttpException::class);
        }

        self::assertTrue($controller->beforeAction(new Action('env', $controller)));
    }

    #[TestWith([42, true])]
    #[TestWith([84, false])]
    public function testFormLayoutRequiresPermissionForRequestedForm(int $formId, bool $hasFormPermission): void
    {
        $permissions = [
            strtolower(Freeform::PERMISSION_FORMS_ACCESS),
            strtolower(PermissionHelper::prepareNestedPermission(Freeform::PERMISSION_FORMS_MANAGE, 42)),
        ];
        $request = $this->configureApp(true, $permissions);
        $forms = $this->createMock(FormsService::class);
        $forms->expects($hasFormPermission ? self::once() : self::never())->method('getFormById')->willReturn(null);
        $controller = $this->getMockBuilder(LayoutController::class)->disableOriginalConstructor()->onlyMethods(['getFormsService'])->getMock();
        $controller->request = $request;
        $controller->method('getFormsService')->willReturn($forms);

        $this->expectException($hasFormPermission ? NotFoundHttpException::class : ForbiddenHttpException::class);
        PermissionHelper::asAuthenticatedUser(static fn () => $controller->actionGet($formId), $permissions);
    }

    public function testDelegatedFormEditorCannotChangeGlobalFieldGroups(): void
    {
        $request = $this->configureApp(true, [
            strtolower(Freeform::PERMISSION_FORMS_ACCESS),
            strtolower(PermissionHelper::prepareNestedPermission(Freeform::PERMISSION_FORMS_MANAGE, 42)),
        ]);
        $controller = (new \ReflectionClass(GroupsController::class))->newInstanceWithoutConstructor();
        $controller->request = $request;
        $request->expects(self::never())->method('getBodyParam');

        $this->expectException(ForbiddenHttpException::class);
        (new \ReflectionMethod(GroupsController::class, 'post'))->invoke($controller);
    }

    private function configureApp(bool $isCp, array $permissions): Request
    {
        $request = $this->createConfiguredMock(Request::class, ['getIsCpRequest' => $isCp, 'getIsConsoleRequest' => false]);
        $user = $this->createConfiguredMock(User::class, ['getIsAdmin' => false]);
        $user->method('checkPermission')->willReturnCallback(static fn (string $permission) => \in_array($permission, $permissions, true));
        \Craft::$app = new class($request, $user) {
            public function __construct(public Request $request, private User $user) {}

            public function getUser(): User
            {
                return $this->user;
            }

            public function getIsLive(): bool
            {
                return true;
            }
        };

        return $request;
    }
}
