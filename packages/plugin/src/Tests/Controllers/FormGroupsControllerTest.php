<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\db\Connection;
use craft\models\Site;
use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\api\FormGroupsController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\EditionHelper;
use Solspace\Freeform\Services\FormsService;
use yii\db\Transaction;
use yii\mutex\FileMutex;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\MethodNotAllowedHttpException;

#[CoversClass(FormGroupsController::class)]
class FormGroupsControllerTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousYiiApp;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
    }

    public function testReadOnlyUsersCannotMoveForms(): void
    {
        [$controller] = $this->fixture(allowed: false);
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionMove();
    }

    public function testMoveRequiresPost(): void
    {
        [$controller] = $this->fixture(post: false);
        $this->expectException(MethodNotAllowedHttpException::class);
        $controller->actionMove();
    }

    #[TestWith(['formId', -1])]
    #[TestWith(['formId', 'invalid'])]
    #[TestWith(['beforeId', 0])]
    #[TestWith(['siteId', null])]
    #[TestWith(['groupUid', []])]
    public function testRejectsMalformedMoves(string $key, mixed $value): void
    {
        [$controller] = $this->fixture(params: [$key => $value]);
        $this->expectException(BadRequestHttpException::class);
        $controller->actionMove();
    }

    public function testRejectsAnUneditableSite(): void
    {
        [$controller] = $this->fixture(params: ['siteId' => 9]);
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionMove();
    }

    public function testExpressCannotReorderCards(): void
    {
        [$controller] = $this->fixture(edition: Freeform::EDITION_EXPRESS);
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionMove();
    }

    public function testLiteCannotMoveIntoGroups(): void
    {
        [$controller] = $this->fixture(params: ['groupUid' => 'sales']);
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionMove();
    }

    public function testUnavailableFormRollsBackAndReleasesTheMoveLock(): void
    {
        [$controller, $db, $mutex] = $this->fixture();
        $transaction = $this->createMock(Transaction::class);
        $transaction->expects(self::once())->method('rollBack');
        $transaction->expects(self::never())->method('commit');
        $db->method('beginTransaction')->willReturn($transaction);
        $mutex->expects(self::once())->method('acquire')->with('freeform-form-card-move', 5)->willReturn(true);
        $mutex->expects(self::once())->method('release')->with('freeform-form-card-move');
        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Form is no longer available');
        $controller->actionMove();
    }

    private function fixture(array $params = [], bool $allowed = true, bool $post = true, string $edition = Freeform::EDITION_LITE): array
    {
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['edition', 'isPro'])->getMock();
        $plugin->method('edition')->willReturn(new EditionHelper($edition, [Freeform::EDITION_EXPRESS, Freeform::EDITION_LITE, Freeform::EDITION_PRO]));
        $plugin->method('isPro')->willReturn(Freeform::EDITION_PRO === $edition);
        $request = $this->createMock(Request::class);
        $params = array_replace(['formId' => 1, 'siteId' => 2, 'beforeId' => null, 'groupUid' => null], $params);
        $request->method('post')->willReturnCallback(static fn ($name, $default = null) => $params[$name] ?? $default);
        $request->method('getIsPost')->willReturn($post);
        $request->method('getIsConsoleRequest')->willReturn(false);
        $db = $this->createMock(Connection::class);
        $db->expects(self::never())->method('createCommand');
        $mutex = $this->createMock(FileMutex::class);
        $site = new Site(['id' => 2, 'handle' => 'english']);
        $sites = new class($site) {
            public function __construct(private Site $site) {}

            public function getEditableSites(): array
            {
                return [$this->site];
            }

            public function getSiteById($id): Site
            {
                return $this->site;
            }
        };
        $user = new class($allowed) {
            public function __construct(private bool $allowed) {}

            public function getIsAdmin(): bool
            {
                return false;
            }

            public function checkPermission($permission): bool
            {
                TestCase::assertSame(strtolower(Freeform::PERMISSION_FORMS_MANAGE), $permission);

                return $this->allowed;
            }
        };
        \Craft::$app = \Yii::$app = new class($plugin, $request, $db, $mutex, $sites, $user) {
            public array $loadedModules;

            public function __construct($plugin, public Request $request, public Connection $db, private object $mutex, public object $sites, private object $user)
            {
                $this->loadedModules = [Freeform::class => $plugin];
            }

            public function getUser(): object
            {
                return $this->user;
            }

            public function getRequest(): Request
            {
                return $this->request;
            }

            public function getMutex(): object
            {
                return $this->mutex;
            }
        };
        $forms = $this->createMock(FormsService::class);
        $forms->method('getAllNonArchivedForms')->willReturn([]);
        $controller = $this->getMockBuilder(FormGroupsController::class)->disableOriginalConstructor()->onlyMethods(['getFormsService'])->getMock();
        $controller->request = $request;
        $controller->method('getFormsService')->willReturn($forms);

        return [$controller, $db, $mutex];
    }
}
