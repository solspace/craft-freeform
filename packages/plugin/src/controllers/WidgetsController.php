<?php

namespace Solspace\Freeform\controllers;

use Solspace\Freeform\Widgets\Pro\RecentWidget;
use Solspace\Freeform\Widgets\QuickFormWidget;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class WidgetsController extends BaseController
{
    public function actionRefresh(): Response
    {
        $this->requireCpRequest();
        $this->requirePostRequest();
        $this->requireAcceptsJson();

        // Craft scopes this lookup to the authenticated user's dashboard.
        $widgetId = (int) $this->request->getRequiredBodyParam('widgetId');
        $widget = \Craft::$app->getDashboard()->getWidgetById($widgetId);
        if (!$widget instanceof RecentWidget && !$widget instanceof QuickFormWidget) {
            throw new NotFoundHttpException('Widget not found.');
        }

        $this->response->getHeaders()->set('Cache-Control', 'no-store, private');
        $view = $this->getView();

        return $this->asJson([
            'html' => $widget->getBodyHtml(),
            'headHtml' => $view->getHeadHtml(),
            'bodyHtml' => $view->getBodyHtml(),
        ]);
    }
}
