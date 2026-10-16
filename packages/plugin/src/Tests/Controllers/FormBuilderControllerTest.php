<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\web\Request;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\api\FormsController;
use yii\web\BadRequestHttpException;

/**
 * @coversNothing
 */
class FormBuilderControllerTest extends TestCase
{
    public function testBuilderRejectsNonControlPanelRequests(): void
    {
        $request = $this->createMock(Request::class);
        $request->method('getIsCpRequest')->willReturn(false);
        $controller = (new \ReflectionClass(FormsController::class))->newInstanceWithoutConstructor();
        $controller->request = $request;
        $this->expectException(BadRequestHttpException::class);
        $controller->actionBuilder(42);
    }
}
