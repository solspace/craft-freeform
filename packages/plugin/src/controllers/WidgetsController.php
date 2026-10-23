<?php

namespace Solspace\Freeform\controllers;

use Solspace\Freeform\Services\FormDashboardWidgetsService;
use Solspace\Freeform\Widgets\Pro\RecentWidget;
use Solspace\Freeform\Widgets\QuickFormWidget;
use yii\web\BadRequestHttpException;
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
        $widget = $widgetId < 0
            ? \Craft::$container->get(FormDashboardWidgetsService::class)->findWidgetById($widgetId)
            : \Craft::$app->getDashboard()->getWidgetById($widgetId);
        if (!$widget instanceof RecentWidget && !$widget instanceof QuickFormWidget) {
            throw new NotFoundHttpException('Widget not found.');
        }

        $formId = $this->request->getBodyParam('formId');
        if ($widget instanceof RecentWidget && null !== $formId) {
            if ('' !== $formId && false === filter_var($formId, \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]])) {
                throw new BadRequestHttpException('Invalid form filter.');
            }

            $widget->setFormFilter('' === $formId ? null : (int) $formId);
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
