<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\Controllers;

use craft\web\Controller;
use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Form\Types\Surveys\Models\SurveySettings;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\StringHelper;
use yii\web\Response;

class SurveySettingsController extends Controller
{
    public function __construct($id, $module, $config, private FieldTypesProvider $fieldTypesProvider)
    {
        parent::__construct($id, $module, $config);
    }

    public function actionIndex(): Response
    {
        $freeformSettings = Freeform::getInstance()->getSettings();

        $settings = SurveySettings::fromSettings($freeformSettings->surveys ?? []);

        if ('application/json' === $this->request->headers->get('accept')) {
            return $this->asJson($settings);
        }

        $fieldTypes = [];
        foreach ($settings->chartTypes as $fieldType => $chartType) {
            $fieldTypes[$fieldType] = $this->fieldTypesProvider->getFieldType($fieldType);
        }

        $fieldTypes = array_filter($fieldTypes);

        return $this->renderTemplate(
            'freeform-surveys/settings',
            [
                'settings' => $settings,
                'fieldTypes' => $fieldTypes,
                'options' => [
                    SurveySettings::CHART_HORIZONTAL => SurveySettings::CHART_HORIZONTAL,
                    SurveySettings::CHART_VERTICAL => SurveySettings::CHART_VERTICAL,
                    SurveySettings::CHART_PIE => SurveySettings::CHART_PIE,
                    SurveySettings::CHART_DONUT => SurveySettings::CHART_DONUT,
                    SurveySettings::CHART_HIDDEN => SurveySettings::CHART_HIDDEN,
                    SurveySettings::CHART_TEXT => SurveySettings::CHART_TEXT,
                ],
            ],
        );
    }

    public function actionSave(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();

        $request = \Craft::$app->request;

        $chartTypes = $request->post('chartTypes');
        $highlightHighest = $request->post('highlightHighest', true);

        $data = [
            'surveys' => [
                'chartTypes' => $chartTypes,
                'highlightHighest' => (bool) $highlightHighest,
            ],
        ];

        $plugin = Freeform::getInstance();
        if (\Craft::$app->plugins->savePluginSettings($plugin, $data)) {
            \Craft::$app->session->setNotice(Freeform::t('Settings Saved'));

            return $this->redirectToPostedUrl();
        }

        $errors = $plugin->getSettings()->getErrors();
        \Craft::$app->session->setError(
            implode("\n", StringHelper::flattenArrayValues($errors))
        );

        return $this->redirectToPostedUrl();
    }
}
