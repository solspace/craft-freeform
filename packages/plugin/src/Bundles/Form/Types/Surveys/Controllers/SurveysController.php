<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\Controllers;

use Solspace\Freeform\Bundles\Form\Types\Surveys\Providers\ChartDataProvider;
use Solspace\Freeform\Bundles\Form\Types\Surveys\Survey;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class SurveysController extends BaseApiController
{
    public function actionChartData(string $handle): Response
    {
        $chartDataProvider = \Craft::$container->get(ChartDataProvider::class);
        $form = $this->getForm($handle);

        return $this->asJson($chartDataProvider->get($form));
    }

    public function actionResults(string $handle): Response
    {
        $form = $this->getForm($handle);

        return $this->asJson($form->getSurveyResults());
    }

    private function getForm(string $handle): Survey
    {
        $form = Freeform::getInstance()->forms->getFormByHandle($handle);
        if (!$form instanceof Survey) {
            throw new NotFoundHttpException('Form does not exist');
        }

        return $form;
    }
}
