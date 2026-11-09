<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\models\Site;
use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\api\FormCardsController;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\EditionHelper;
use Solspace\Freeform\Library\Helpers\FormCardHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\FormsService;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\HttpException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

#[CoversClass(FormCardsController::class)]
class FormCardsControllerTest extends TestCase
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

    #[TestWith(['1x1'])]
    #[TestWith(['2x1'])]
    #[TestWith(['1x2'])]
    #[TestWith(['2x2'])]
    public function testSavesOnlyTheCurrentUsersPreference(string $size): void
    {
        [$controller, $preferences, $identity] = $this->fixture(['size' => $size]);
        $controller->actionSaveSize();
        self::assertSame($identity, $preferences->user);
        self::assertSame(['freeform.cardSize.2.form-uid' => $size], $preferences->values);
    }

    #[TestWith(['formId', 0])]
    #[TestWith(['siteId', -1])]
    #[TestWith(['size', '3x2'])]
    #[TestWith(['size', []])]
    public function testRejectsInvalidSizesBeforeSaving(string $key, mixed $value): void
    {
        [$controller, $preferences] = $this->fixture([$key => $value]);

        try {
            $controller->actionSaveSize();
            self::fail('Expected validation failure');
        } catch (BadRequestHttpException) {
            self::assertSame([], $preferences->values);
        }
    }

    public function testRequiresPost(): void
    {
        [$controller] = $this->fixture(post: false);
        $this->expectException(HttpException::class);
        $controller->actionSaveSize();
    }

    public function testRequiresDashboardAccess(): void
    {
        [$controller] = $this->fixture(allowed: false);
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionSaveSize();
    }

    public function testRejectsUneditableSites(): void
    {
        [$controller] = $this->fixture(['siteId' => 3]);
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionSaveSize();
    }

    public function testRejectsUnavailableForms(): void
    {
        [$controller] = $this->fixture(['formId' => 99]);
        $this->expectException(NotFoundHttpException::class);
        $controller->actionSaveSize();
    }

    public function testActivityRequiresSubmissionAccess(): void
    {
        [$controller] = $this->fixture();
        $this->expectException(ForbiddenHttpException::class);
        PermissionHelper::asAuthenticatedUser(static fn () => $controller->actionActivity(1), [strtolower(Freeform::PERMISSION_FORMS_ACCESS)]);
    }

    #[TestWith([null])]
    #[TestWith(['invalid'])]
    #[TestWith([['2x2']])]
    public function testInvalidStoredPreferencesUseTheStandardSize(mixed $size): void
    {
        self::assertSame('1x1', FormCardHelper::normalizeSize($size));
        self::assertNotSame(FormCardHelper::preferenceKey(2, 'one'), FormCardHelper::preferenceKey(3, 'one'));
    }

    #[TestWith([7])]
    #[TestWith([30])]
    #[TestWith([90])]
    public function testSavesRangeForCurrentUserAndSite(int $days): void
    {
        [$controller, $preferences] = $this->fixture(['days' => $days]);
        $controller->actionSaveRange();
        self::assertSame(['freeform.cardRange.2' => $days], $preferences->values);
    }

    #[TestWith([0])]
    #[TestWith([14])]
    #[TestWith([[]])]
    public function testRejectsInvalidRanges(mixed $days): void
    {
        [$controller] = $this->fixture(['days' => $days]);
        $this->expectException(BadRequestHttpException::class);
        $controller->actionSaveRange();
    }

    public function testSavesOverviewPreferenceWithoutSubmissionPermission(): void
    {
        [$controller, $preferences] = $this->fixture(['content' => 'overview', 'fieldId' => 99]);
        $controller->actionSavePreferences();
        self::assertSame(['freeform.cardContent.2.form-uid' => ['content' => 'overview', 'fieldId' => null]], $preferences->values);
    }

    #[TestWith(['activity'])]
    #[TestWith(['statistics'])]
    #[TestWith(['field'])]
    public function testRejectsSubmissionContentWithoutPermission(string $content): void
    {
        [$controller] = $this->fixture(['content' => $content]);
        $this->expectException(ForbiddenHttpException::class);
        PermissionHelper::asAuthenticatedUser(static fn () => $controller->actionSavePreferences(), [strtolower(Freeform::PERMISSION_FORMS_ACCESS)]);
    }

    public function testRejectsUnknownContent(): void
    {
        [$controller] = $this->fixture(['content' => 'private-field-values']);
        $this->expectException(BadRequestHttpException::class);
        $controller->actionSavePreferences();
    }

    public function testFieldSummaryRequiresSubmissionAccess(): void
    {
        [$controller] = $this->fixture();
        $this->expectException(ForbiddenHttpException::class);
        PermissionHelper::asAuthenticatedUser(static fn () => $controller->actionFieldSummary(1), [strtolower(Freeform::PERMISSION_FORMS_ACCESS)]);
    }

    #[TestWith([Freeform::EDITION_LITE])]
    #[TestWith([Freeform::EDITION_EXPRESS])]
    public function testDowngradeBlocksEveryCustomizationEndpointWithoutChangingPreferences(string $edition): void
    {
        foreach (['actionStats', 'actionSaveRange', 'actionSavePreferences', 'actionFields', 'actionFieldSummary', 'actionSaveSize', 'actionActivity'] as $action) {
            [$controller, $preferences] = $this->fixture(edition: $edition);
            $preferences->values = ['freeform.cardSize.2.form-uid' => '2x2'];
            $saved = $preferences->values;

            try {
                $controller->{$action}(1);
                self::fail('Expected Pro restriction for '.$action);
            } catch (ForbiddenHttpException $exception) {
                self::assertSame('Dashboard customization requires Freeform Pro.', $exception->getMessage());
                self::assertSame($saved, $preferences->values);
            }
        }
    }

    private function fixture(array $params = [], bool $post = true, bool $allowed = true, string $edition = Freeform::EDITION_PRO): array
    {
        $request = $this->createMock(Request::class);
        $params = array_replace(['formId' => 1, 'siteId' => 2, 'size' => '2x2'], $params);
        $request->method('post')->willReturnCallback(static fn ($name, $default = null) => $params[$name] ?? $default);
        $request->method('getIsPost')->willReturn($post);
        $request->method('getIsConsoleRequest')->willReturn(false);
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
        $identity = new \stdClass();
        $user = new class($allowed, $identity) {
            public function __construct(private bool $allowed, private object $identity) {}

            public function getIsAdmin(): bool
            {
                return false;
            }

            public function checkPermission($permission): bool
            {
                return $this->allowed && strtolower(Freeform::PERMISSION_FORMS_ACCESS) === $permission;
            }

            public function getIdentity(): object
            {
                return $this->identity;
            }
        };
        $preferences = new class {
            public array $values = [];
            public ?object $user = null;

            public function saveUserPreferences($user, $values): void
            {
                $this->user = $user;
                $this->values = $values;
            }
        };
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['edition', 'getSettings'])->getMock();
        $plugin->edition = $edition;
        $settings = $this->getMockBuilder(Settings::class)->disableOriginalConstructor()->onlyMethods(['__call'])->getMock();
        $settings->method('__call')->willReturn(false);
        $plugin->method('getSettings')->willReturn($settings);
        $plugin->method('edition')->willReturn(new EditionHelper($edition, [Freeform::EDITION_EXPRESS, Freeform::EDITION_LITE, Freeform::EDITION_PRO]));
        \Craft::$app = \Yii::$app = new class($request, $sites, $user, $preferences, $plugin) {
            public array $loadedModules;

            public function __construct(public Request $request, public object $sites, private object $user, private object $preferences, object $plugin)
            {
                $this->loadedModules = [Freeform::class => $plugin];
            }

            public function getRequest(): Request
            {
                return $this->request;
            }

            public function getUser(): object
            {
                return $this->user;
            }

            public function getUsers(): object
            {
                return $this->preferences;
            }
        };
        $form = $this->createMock(Form::class);
        $form->method('getUid')->willReturn('form-uid');
        $forms = $this->createMock(FormsService::class);
        $forms->method('getAllNonArchivedForms')->willReturn([1 => $form]);
        $controller = $this->getMockBuilder(FormCardsController::class)->disableOriginalConstructor()->onlyMethods(['requireCpRequest', 'getFormsService', 'asJson'])->getMock();
        $controller->request = $request;
        $controller->response = new Response(['charset' => 'UTF-8']);
        $controller->method('getFormsService')->willReturn($forms);
        $controller->method('asJson')->willReturn(new Response(['charset' => 'UTF-8']));

        return [$controller, $preferences, $identity];
    }
}
