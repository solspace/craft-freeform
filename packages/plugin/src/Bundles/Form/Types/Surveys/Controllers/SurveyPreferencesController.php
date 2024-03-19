<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\Controllers;

use Solspace\Freeform\Bundles\Form\Types\Surveys\Models\SurveySettings;
use Solspace\Freeform\Bundles\Form\Types\Surveys\Records\SurveyPreferencesRecord;
use Solspace\Freeform\Bundles\Form\Types\Surveys\Survey;
use Solspace\Freeform\Bundles\Form\Types\Surveys\SurveysBundle;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use yii\web\NotFoundHttpException;

class SurveyPreferencesController extends BaseApiController
{
    public function getOne(int|string $id): array
    {
        $form = $this->getForm($id);

        $settings = SurveySettings::fromSettings(Freeform::getInstance()->getSettings()->surveys ?? []);
        $userPreferences = SurveyPreferencesRecord::findAll(['userId' => \Craft::$app->getUser()->getId()]);

        $canModifyForm = PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_MANAGE.':'.$form->getId())
            || PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_MANAGE);

        $canViewSubmissions =
            PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS)
            && (
                PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE)
                || PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE.':'.$form->getId())
                || PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_READ)
                || PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_READ.':'.$form->getId())
            );

        $canManageReports = PermissionHelper::checkPermission(SurveysBundle::PERMISSION_REPORTS_MANAGE);

        return [
            'highlightHighest' => $settings->highlightHighest,
            'chartDefaults' => $settings->chartTypes,
            'permissions' => [
                'form' => $canModifyForm,
                'submissions' => $canViewSubmissions,
                'reports' => $canManageReports,
            ],
            'fieldSettings' => array_map(
                function (SurveyPreferencesRecord $preference) {
                    return [
                        'id' => $preference->fieldId,
                        'chartType' => $preference->chartType,
                    ];
                },
                $userPreferences
            ),
        ];
    }

    protected function put(null|int|string $id = null): null|array|object
    {
        PermissionHelper::requirePermission(SurveysBundle::PERMISSION_REPORTS_MANAGE);
        $request = $this->request;

        $fieldId = $request->post('fieldId');
        $chartType = $request->post('chartType', 'Horizontal');

        $userId = \Craft::$app->getUser()->getId();

        $record = SurveyPreferencesRecord::findOne([
            'userId' => $userId,
            'fieldId' => $fieldId,
        ]);

        if (!$record) {
            $record = new SurveyPreferencesRecord();
            $record->userId = $userId;
            $record->fieldId = $fieldId;
        }

        $record->chartType = $chartType;
        $record->save();

        return null;
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
