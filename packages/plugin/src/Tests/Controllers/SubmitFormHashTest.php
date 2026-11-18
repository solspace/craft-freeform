<?php

namespace Solspace\Freeform\Tests\Controllers;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\Context\Session\SessionContext;
use Solspace\Freeform\controllers\FileUploadController;
use Solspace\Freeform\controllers\SubmitController;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Helpers\HashHelper;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\SubmissionsService;
use yii\web\NotFoundHttpException;
use yii\web\Request;
use yii\web\Response;

#[CoversNothing]
class SubmitFormHashTest extends TestCase
{
    private const SECURITY_KEY = 'form-hash-test';

    private mixed $previousApp;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
    }

    #[DataProvider('invalidHashes')]
    public function testRegularSubmitRejectsInvalidHash(array $body): void
    {
        $controller = $this->submitController($body);

        $this->expectException(NotFoundHttpException::class);
        $this->expectExceptionMessage('Form not found');
        $controller->actionIndex();
    }

    public static function invalidHashes(): iterable
    {
        yield 'missing' => [[]];

        yield 'malformed' => [[SessionContext::KEY_HASH => 'invalid']];

        yield 'undecodable' => [[SessionContext::KEY_HASH => '0-page-session']];

        yield 'non-string' => [[SessionContext::KEY_HASH => []]];
    }

    public function testAjaxSubmitSendsExistingJsonErrorWith404(): void
    {
        $controller = $this->submitController([], ajax: true);
        $response = $this->createPartialMock(Response::class, ['send']);
        $controller->response = $response;

        // Stop after inspecting the response so the action's exit cannot end PHPUnit.
        $responseSent = new \RuntimeException('Response sent');
        $response->expects(self::once())->method('send')->willReturnCallback(static function () use ($response, $responseSent): void {
            self::assertSame(404, $response->getStatusCode());
            self::assertSame(Response::FORMAT_JSON, $response->format);
            self::assertFalse($response->data['success']);
            self::assertSame('Form not found', $response->data['message']);

            throw $responseSent;
        });

        $this->expectExceptionObject($responseSent);
        $controller->actionIndex();
    }

    public function testQuickSaveRejectsMissingHash(): void
    {
        $controller = $this->submitController(['storage-secret' => 'test-secret']);

        $this->expectException(NotFoundHttpException::class);
        $this->expectExceptionMessage('Form not found');
        $controller->actionQuickSave();
    }

    public function testFileUploadRejectsMissingHash(): void
    {
        $controller = $this->createPartialMock(FileUploadController::class, ['getFormsService']);
        $controller->request = $this->setRequest([]);
        $controller->expects(self::never())->method('getFormsService');

        $this->expectException(NotFoundHttpException::class);
        $this->expectExceptionMessage('Form not found');
        $controller->actionPost();
    }

    public function testValidHashResolvesFormForThePostedSiteAndInstance(): void
    {
        $formHash = HashHelper::hash(42, self::SECURITY_KEY);
        $controller = $this->submitController([
            SessionContext::KEY_HASH => $formHash.'-page-session',
            SessionContext::KEY_SITE_HANDLE => 'secondary',
            SessionContext::KEY_UNIQUE_ID => 'form-instance',
        ]);
        $form = $this->createMock(Form::class);
        $form->expects(self::once())->method('handleRequest')->with($controller->request)->willReturn(false);
        $form->expects(self::once())->method('persistState');

        $forms = $this->createMock(FormsService::class);
        $forms->expects(self::once())->method('getFormById')->with(42, 'secondary', 'form-instance')->willReturn($form);
        $controller->method('getFormsService')->willReturn($forms);
        $controller->method('getSubmissionsService')->willReturn($this->createStub(SubmissionsService::class));

        self::assertNull($controller->actionIndex());
    }

    private function submitController(array $body, bool $ajax = false): MockObject&SubmitController
    {
        $controller = $this->createPartialMock(SubmitController::class, ['getFormsService', 'getSubmissionsService']);
        $controller->request = $this->setRequest($body, $ajax);

        return $controller;
    }

    private function setRequest(array $body, bool $ajax = false): Request
    {
        $request = $this->createStub(Request::class);
        $request->method('getIsPost')->willReturn(true);
        $request->method('getIsAjax')->willReturn($ajax);
        $request->method('getIsConsoleRequest')->willReturn(false);
        $request->method('post')->willReturnCallback(static fn ($name, $default = null) => $body[$name] ?? $default);
        \Craft::$app = new class($request, self::SECURITY_KEY) {
            public function __construct(public Request $request, private string $securityKey) {}

            public function getRequest(): Request
            {
                return $this->request;
            }

            public function getConfig(): object
            {
                return $this;
            }

            public function getGeneral(): object
            {
                return (object) ['securityKey' => $this->securityKey];
            }
        };

        return $request;
    }
}
