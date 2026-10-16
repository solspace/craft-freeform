<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use yii\web\Response;

#[CoversClass(FormsController::class)]
class FormSaveValidationTest extends TestCase
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

    #[TestWith([FormsController::EVENT_UPDATE_FORM, [FormsController::EVENT_UPDATE_FORM]])]
    #[TestWith([FormsController::EVENT_UPSERT_FORM, [FormsController::EVENT_UPDATE_FORM, FormsController::EVENT_UPSERT_FORM]])]
    #[TestWith([null, [FormsController::EVENT_UPDATE_FORM, FormsController::EVENT_UPSERT_FORM, FormsController::EVENT_AFTER_SAVE_FORM]])]
    public function testSaveStopsAtValidationFailure(?string $errorStage, array $expectedStages): void
    {
        $request = $this->createMock(Request::class);
        $request->method('getIsConsoleRequest')->willReturn(true);
        $request->method('getRawBody')->willReturn('{}');
        \Craft::$app = (object) ['request' => $request];

        $controller = (new \ReflectionClass(FormsController::class))->newInstanceWithoutConstructor();
        $controller->request = $request;
        $controller->response = (new \ReflectionClass(Response::class))->newInstanceWithoutConstructor();
        $stages = [];
        $errors = ['general' => ['handle' => ['Handle has already been taken.']]];
        foreach ([FormsController::EVENT_UPDATE_FORM, FormsController::EVENT_UPSERT_FORM, FormsController::EVENT_AFTER_SAVE_FORM] as $stage) {
            $controller->on($stage, static function (PersistFormEvent $event) use ($stage, $errorStage, $errors, &$stages) {
                $stages[] = $stage;
                if ($stage === $errorStage) {
                    $event->addErrorsToResponse('form', $errors);
                }
            });
        }

        $result = (new \ReflectionMethod(FormsController::class, 'post'))->invoke($controller, 7);

        self::assertSame($expectedStages, $stages);
        self::assertSame($errorStage ? 400 : 204, $controller->response->statusCode);
        self::assertSame($errorStage ? ['errors' => ['form' => $errors]] : [], $result);
    }
}
