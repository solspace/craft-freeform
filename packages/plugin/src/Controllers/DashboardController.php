<?php

namespace Solspace\Freeform\Controllers;

use Carbon\Carbon;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Resources\Bundles\BannerBundle;
use Solspace\Freeform\Resources\Bundles\DashboardBundle;
use Solspace\Freeform\Resources\Bundles\LogBundle;
use yii\web\Response;

class DashboardController extends BaseController
{
    public function actionIndex(): Response
    {
        $forms = $this->getFormsService()->getAllForms();
        $logReader = $this->getLoggerService()->getLogReader();

        $totalSubmissions = $this->getSubmissionsService()->getSubmissionCount();
        $totalSpam = $this->getSubmissionsService()->getSubmissionCount(null, null, true);
        $totalSubmissionsByForm = $this->getSubmissionsService()->getSubmissionCountByForm(false);
        $totalSpamByForm = $this->getSubmissionsService()->getSubmissionCountByForm(true);

        if ($forms) {
            $chartData = $this->getChartsService()
                ->getStackedAreaChartData(
                    new Carbon('-60 days'),
                    new Carbon('now'),
                    array_keys($forms)
                )
            ;
        } else {
            $chartData = $this->getChartsService()->getFakeStackedChartData();
        }

        $formList = [];
        foreach ($forms as $form) {
            $formList[] = $form->getForm();
        }

        $settingsService = $this->getSettingsService();
        $isSpamFolderEnabled = $settingsService->isSpamFolderEnabled();

        $integrations = $this->getIntegrationsService()->getAllIntegrations();

        \Craft::$app->view->registerAssetBundle(DashboardBundle::class);
        \Craft::$app->view->registerAssetBundle(LogBundle::class);
        \Craft::$app->view->registerAssetBundle(BannerBundle::class);
        $this->getLoggerService()->registerJsTranslations($this->view);

        $exportTypes = [
            'excel' => 'Excel',
            'csv' => 'CSV',
            'json' => 'JSON',
            'xml' => 'XML',
            'text' => 'Text',
        ];

        $updates = $whatsNew = [];
        $updatesLevel = 'info';
        if (Freeform::getInstance()->settings->getSettingsModel()->displayFeed) {
            $messages = Freeform::getInstance()->feed->getUnreadFeedMessages();
            foreach ($messages as $message) {
                if ('new' === $message->type) {
                    $whatsNew[] = $message;

                    continue;
                }

                if ('critical' !== $updatesLevel && \in_array($message->type, ['critical', 'warning'], true)) {
                    $updatesLevel = $message->type;
                }

                $updates[] = $message;
            }
        }

        return $this->renderTemplate(
            'freeform/dashboard',
            [
                'totalSubmissions' => $totalSubmissions,
                'totalSpam' => $totalSpam,
                'submissionsByForm' => $totalSubmissionsByForm,
                'spamByForm' => $totalSpamByForm,
                'forms' => $formList,
                'formCount' => \count($forms),
                'integrations' => $integrations,
                'logReader' => $logReader,
                'isSpamFolderEnabled' => $isSpamFolderEnabled,
                'chartData' => $chartData,
                'exportTypes' => $exportTypes,
                'whatsNew' => $whatsNew,
                'updates' => $updates,
                'updatesLevel' => $updatesLevel,
            ]
        );
    }
}
