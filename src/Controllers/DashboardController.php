<?php

namespace Solspace\Freeform\Controllers;

use Carbon\Carbon;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Models\FormModel;
use Solspace\Freeform\Resources\Bundles\ChartJsBundle;
use Solspace\Freeform\Resources\Bundles\DashboardBundle;
use Solspace\Freeform\Resources\Bundles\LogBundle;
use yii\web\Response;

class DashboardController extends BaseController
{
    /**
     * @return Response
     */
    public function actionIndex(): Response
    {
        $submissionCount = $this->getSubmissionsService()->getSubmissionCount();
        $submissions     = Submission::find()->limit(10)->all();
        $forms           = $this->getFormsService()->getAllForms();
        $logReader       = $this->getLoggerService()->getLogReader();

        $chartData = $this->getChartsService()
            ->getLinearSubmissionChartData(
                new Carbon('-60 days 00:00:00', 'UTC'),
                new Carbon(null, 'UTC'),
                array_keys($forms)
            )
            ->setLegends(false);

        $pieChartData = $this->getChartsService()
            ->getRadialFormSubmissionData(
                new Carbon('-60 days 00:00:00', 'UTC'),
                new Carbon(null, 'UTC'),
                $forms
            )
            ->setLegends(false);

        $totalSubmissionsByForm = $this->getSubmissionsService()->getSubmissionCountByForm();

        usort($forms, function (FormModel $a, FormModel $b) use ($totalSubmissionsByForm) {
            $aSub = $totalSubmissionsByForm[$a->id] ?? 0;
            $bSub = $totalSubmissionsByForm[$b->id] ?? 0;

            return $bSub <=> $aSub;
        });

        $formList = \array_slice($forms, 0, 10, true);

        $totalSpamSubmissions = $this->getSpamSubmissionsService()->getSubmissionCount(null, null, true);

        $settingsService     = $this->getSettingsService();
        $submissionPurge     = $settingsService->getPurgableSubmissionAgeInDays();
        $isSpamFolderEnabled = $settingsService->isSpamFolderEnabled();
        $spamPurge           = $isSpamFolderEnabled && $settingsService->getPurgableSpamAgeInDays();

        $settings = [
            ['label' => 'Spam Protection', 'enabled' => $settingsService->isFreeformHoneypotEnabled()],
            ['label' => 'Spam Folder', 'enabled' => $isSpamFolderEnabled],
            [
                'label'   => 'Spam Automatic Purge',
                'enabled' => $spamPurge,
                'extra'   => $spamPurge ? "$spamPurge days" : null,
            ],
            ['delimiter' => true],
            [
                'label'   => 'Automatic Submission Purge',
                'enabled' => $submissionPurge,
                'extra'   => $submissionPurge ? "$submissionPurge days" : null,
            ],
        ];

        if (Freeform::getInstance()->isPro()) {
            array_splice(
                $settings,
                3,
                0,
                [['label' => 'reCAPTCHA', 'enabled' => (bool) $settingsService->getSettingsModel()->recaptchaEnabled]]
            );
        }

        $integrations = $this->getIntegrationsService()->getAllIntegrations();

        \Craft::$app->view->registerAssetBundle(DashboardBundle::class);
        \Craft::$app->view->registerAssetBundle(ChartJsBundle::class);
        \Craft::$app->view->registerAssetBundle(LogBundle::class);
        $this->getLoggerService()->registerJsTranslations($this->view);

        return $this->renderTemplate(
            'freeform/dashboard',
            [
                'submissionCount'      => $submissionCount,
                'submissions'          => $submissions,
                'submissionsByForm'    => $totalSubmissionsByForm,
                'totalSpamSubmissions' => $totalSpamSubmissions,
                'forms'                => $formList,
                'formCount'            => \count($forms),
                'integrations'         => $integrations,
                'logReader'            => $logReader,
                'isSpamFolderEnabled'  => $isSpamFolderEnabled,
                'chartData'            => $chartData,
                'pieChartData'         => $pieChartData,
                'settings'             => $settings,
            ]
        );
    }
}
