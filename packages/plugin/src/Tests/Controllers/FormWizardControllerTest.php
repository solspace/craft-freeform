<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\api\forms\WizardController;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\FormWizard\PreviewForm;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\FormWizardService;
use yii\web\BadRequestHttpException;
use yii\web\HttpException;
use yii\web\Response;

#[CoversClass(WizardController::class)]
#[CoversClass(PreviewForm::class)]
class FormWizardControllerTest extends TestCase
{
    #[TestWith(['actionOptions'])]
    #[TestWith(['actionPreview'])]
    #[TestWith(['actionCreate'])]
    public function testAllWizardEndpointsRequireTheControlPanel(string $action): void
    {
        $request = $this->createMock(Request::class);
        $request->method('getIsPost')->willReturn(true);
        $request->method('getIsCpRequest')->willReturn(false);
        $controller = (new \ReflectionClass(WizardController::class))->newInstanceWithoutConstructor();
        $controller->request = $request;
        $this->expectException(BadRequestHttpException::class);
        $controller->{$action}();
    }

    #[TestWith(['actionPreview'])]
    #[TestWith(['actionCreate'])]
    public function testCreationAndPreviewRequirePost(string $action): void
    {
        $request = $this->createMock(Request::class);
        $request->method('getIsPost')->willReturn(false);
        $controller = (new \ReflectionClass(WizardController::class))->newInstanceWithoutConstructor();
        $controller->request = $request;
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Post request required');
        $controller->{$action}();
    }

    public function testDraftPreviewNeverReadsOrConsumesARealSubmissionFlash(): void
    {
        $form = (new \ReflectionClass(PreviewForm::class))->newInstanceWithoutConstructor();
        self::assertFalse($form->isSubmittedSuccessfully());
        $form->setPreviewSuccess(true);
        self::assertTrue($form->isSubmittedSuccessfully());
        $form->setPreviewSuccess(false);
        self::assertFalse($form->isSubmittedSuccessfully());
        $form->setPreviewSuccess(true);
        $form->setPreviewError(true);
        self::assertTrue($form->hasErrors());
        self::assertFalse($form->isSubmittedSuccessfully());
    }

    public function testRetryingTheSameRequestReturnsTheSavedFormWithoutCreatingAnother(): void
    {
        $previousApp = \Craft::$app;
        $previousContainer = \Craft::$container;
        $request = $this->createMock(Request::class);
        $request->method('getIsPost')->willReturn(true);
        $request->method('getIsCpRequest')->willReturn(true);
        $request->method('getIsConsoleRequest')->willReturn(false);
        $token = '00000000-0000-4000-8000-000000000001';
        $request->method('getBodyParam')->with('requestToken')->willReturn($token);
        $request->method('getBodyParams')->willReturn(['requestToken' => $token]);
        $form = $this->createMock(Form::class);
        $form->method('getId')->willReturn(42);
        $form->method('getHandle')->willReturn('wizardForm');
        $service = $this->createMock(FormWizardService::class);
        $service->expects(self::once())->method('create')->willReturn($form);
        $forms = $this->createMock(FormsService::class);
        $forms->method('getFormById')->with(42)->willReturn($form);
        $controller = $this->getMockBuilder(WizardController::class)->disableOriginalConstructor()->onlyMethods(['getFormsService'])->getMock();
        $controller->method('getFormsService')->willReturn($forms);
        $controller->request = $request;
        $controller->response = (new \ReflectionClass(Response::class))->newInstanceWithoutConstructor();
        $user = new class {
            public int $id = 7;

            public function getIsAdmin(): bool
            {
                return false;
            }

            public function checkPermission($permission): bool
            {
                return strtolower(Freeform::PERMISSION_FORMS_CREATE) === $permission;
            }
        };
        \Craft::$app = new class($request, $user) {
            public object $cache;
            public object $mutex;

            public function __construct(public object $request, public object $user)
            {
                $this->cache = new class {
                    private array $values = [];

                    public function get($key)
                    {
                        return $this->values[$key] ?? false;
                    }

                    public function set($key, $value, $duration): void
                    {
                        $this->values[$key] = $value;
                    }
                };
                $this->mutex = new class {
                    public function acquire($key, $timeout): bool
                    {
                        return true;
                    }

                    public function release($key): void {}
                };
            }

            public function getUser(): object
            {
                return $this->user;
            }
        };
        \Craft::$container = new class($service) {
            public function __construct(private object $service) {}

            public function get($class): object
            {
                return $this->service;
            }
        };

        try {
            PermissionHelper::asAuthenticatedUser(static function () use ($controller) {
                for ($attempt = 0; $attempt < 2; ++$attempt) {
                    $response = $controller->actionCreate();
                    self::assertSame(['id' => 42, 'handle' => 'wizardForm'], $response->data);
                }
            }, [Freeform::PERMISSION_FORMS_CREATE]);
        } finally {
            \Craft::$app = $previousApp;
            \Craft::$container = $previousContainer;
        }
    }

    public function testEveryWizardTranslationIsRegisteredAndPreservesPlaceholders(): void
    {
        $path = __DIR__.'/../../translations/';
        $english = require $path.'en/wizard.php';
        foreach (['en', 'de', 'fr', 'it', 'nl'] as $language) {
            $registered = require $path.$language.'/freeform.php';
            $dictionary = require $path.$language.'/wizard.php';
            self::assertSame(array_keys($english), array_keys($dictionary));
            foreach ($english as $key => $value) {
                self::assertArrayHasKey($key, $registered);
                preg_match_all('/\{[^{}]+\}/', $value, $expected);
                preg_match_all('/\{[^{}]+\}/', $dictionary[$key], $actual);
                sort($expected[0]);
                sort($actual[0]);
                self::assertSame($expected[0], $actual[0], $language.': '.$key);
            }
        }
    }
}
