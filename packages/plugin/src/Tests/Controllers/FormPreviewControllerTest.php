<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\api\FormsController;
use yii\web\BadRequestHttpException;
use yii\web\MethodNotAllowedHttpException;
use yii\web\Response;

#[CoversClass(FormsController::class)]
class FormPreviewControllerTest extends TestCase
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

    #[TestWith([false, true])]
    #[TestWith([true, false])]
    public function testPreviewRejectsNonPostOrNonCpRequests(bool $post, bool $cp): void
    {
        $request = $this->createMock(Request::class);
        $request->method('getIsPost')->willReturn($post);
        $request->method('getIsCpRequest')->willReturn($cp);
        $controller = (new \ReflectionClass(FormsController::class))->newInstanceWithoutConstructor();
        $controller->request = $request;
        $this->expectException($post ? BadRequestHttpException::class : MethodNotAllowedHttpException::class);
        $controller->actionPreview(42);
    }

    public function testInvalidPreviewUrlStopsSaveBeforePersistenceEvents(): void
    {
        $request = $this->createMock(Request::class);
        $request->method('getIsConsoleRequest')->willReturn(true);
        $request->method('getRawBody')->willReturn('{"form":{"settings":{"general":{"previewCssUrls":"javascript:alert(1)"}}}}');
        \Craft::$app = (object) ['request' => $request];
        $controller = (new \ReflectionClass(FormsController::class))->newInstanceWithoutConstructor();
        $controller->request = $request;
        $controller->response = (new \ReflectionClass(Response::class))->newInstanceWithoutConstructor();
        $controller->on(FormsController::EVENT_UPDATE_FORM, static function () { self::fail('Unsafe URLs must be rejected before saving'); });
        $response = (new \ReflectionMethod(FormsController::class, 'post'))->invoke($controller);
        self::assertSame(400, $controller->response->statusCode);
        self::assertArrayHasKey('previewCssUrls', $response['errors']['form']['general']);
    }

    public function testPreviewTemplateListRejectsNonCpRequests(): void
    {
        $request = $this->createMock(Request::class);
        $request->method('getIsCpRequest')->willReturn(false);
        $controller = (new \ReflectionClass(FormsController::class))->newInstanceWithoutConstructor();
        $controller->request = $request;
        $this->expectException(BadRequestHttpException::class);
        $controller->actionPreviewTemplates(42);
    }
}
