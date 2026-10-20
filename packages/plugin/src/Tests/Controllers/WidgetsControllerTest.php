<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\base\Widget;
use craft\services\Dashboard;
use craft\web\Request;
use craft\web\Response;
use craft\web\View;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\WidgetsController;
use Solspace\Freeform\Widgets\Pro\LinearChartsWidget;
use Solspace\Freeform\Widgets\Pro\RecentWidget;
use yii\web\BadRequestHttpException;
use yii\web\NotFoundHttpException;

#[CoversClass(WidgetsController::class)]
class WidgetsControllerTest extends TestCase
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

    public function testRefreshUsesTheUserScopedWidgetLookupAndReturnsFreshMarkup(): void
    {
        $widget = $this->getMockBuilder(RecentWidget::class)->disableOriginalConstructor()->onlyMethods(['getBodyHtml'])->getMock();
        $widget->expects(self::once())->method('getBodyHtml')->willReturn('<div>Fresh submissions</div>');
        $controller = $this->fixture($widget);

        self::assertSame(['html' => '<div>Fresh submissions</div>', 'headHtml' => 'head', 'bodyHtml' => 'body'], $controller->actionRefresh()->data);
        self::assertSame('no-store, private', $controller->response->getHeaders()->get('Cache-Control'));
    }

    public function testAWidgetNotOwnedByTheUserIsNotRendered(): void
    {
        $controller = $this->fixture(null);
        $this->expectException(NotFoundHttpException::class);
        $controller->actionRefresh();
    }

    public function testUnrelatedWidgetTypesCannotBeRendered(): void
    {
        $widget = $this->getMockBuilder(LinearChartsWidget::class)->disableOriginalConstructor()->onlyMethods(['getBodyHtml'])->getMock();
        $widget->expects(self::never())->method('getBodyHtml');
        $controller = $this->fixture($widget);
        $this->expectException(NotFoundHttpException::class);
        $controller->actionRefresh();
    }

    public function testFrontendRequestsCannotRefreshWidgets(): void
    {
        $controller = $this->fixture(null, false);
        $this->expectException(BadRequestHttpException::class);
        $controller->actionRefresh();
    }

    private function fixture(?Widget $widget, bool $cp = true): WidgetsController
    {
        $request = $this->createMock(Request::class);
        $request->method('getIsCpRequest')->willReturn($cp);
        $request->method('getIsPost')->willReturn(true);
        $request->method('getAcceptsJson')->willReturn(true);
        $request->method('getRequiredBodyParam')->with('widgetId')->willReturn(33);
        $dashboard = $this->createMock(Dashboard::class);
        $dashboard->expects($cp ? self::once() : self::never())->method('getWidgetById')->with(33)->willReturn($widget);
        \Craft::$app = new class($dashboard) {
            public function __construct(private Dashboard $dashboard) {}

            public function getDashboard(): Dashboard
            {
                return $this->dashboard;
            }
        };
        $view = $this->createMock(View::class);
        $view->method('getHeadHtml')->willReturn('head');
        $view->method('getBodyHtml')->willReturn('body');
        $response = (new \ReflectionClass(Response::class))->newInstanceWithoutConstructor();
        $controller = $this->getMockBuilder(WidgetsController::class)->disableOriginalConstructor()->onlyMethods(['getView', 'asJson'])->getMock();
        $controller->request = $request;
        $controller->response = $response;
        $controller->method('getView')->willReturn($view);
        $controller->method('asJson')->willReturnCallback(static function ($data) use ($response) {
            $response->data = $data;

            return $response;
        });

        return $controller;
    }
}
