<?php

namespace Solspace\Freeform\Controllers\REST;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Controllers\BaseController;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Composer;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Library\Translations\CraftTranslator;
use Solspace\Freeform\Models\FormModel;
use yii\web\Response;

class FormsRESTController extends BaseController
{
    public function init(): void
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_MANAGE);

        parent::init();
    }

    public function actionOptions(): Response
    {
        $freeform = Freeform::getInstance();

        $types = array_map(
            function ($type) {
                return [
                    'className' => $type['class'],
                    'name' => $type['name'],
                    'properties' => $type['properties'],
                ];
            },
            $freeform->formTypes->getTypes()
        );

        $statuses = array_map(
            function ($status) {
                return [
                    'name' => $status->name,
                    'id' => $status->id,
                    'isDefault' => $status->isDefault,
                ];
            },
            array_values($freeform->statuses->getAllStatuses())
        );

        $nativeTemplates = $this->getSettingsService()->getSolspaceFormTemplates();
        $customTemplates = $this->getSettingsService()->getCustomFormTemplates();
        $successTemplates = $this->getSettingsService()->getSuccessTemplates();

        $templates = ['native' => [], 'custom' => [], 'success' => []];
        foreach ($nativeTemplates as $template) {
            $templates['native'][] = [
                'id' => $template->getFileName(),
                'name' => $template->getName(),
            ];
        }

        foreach ($customTemplates as $template) {
            $templates['custom'][] = [
                'id' => $template->getFileName(),
                'name' => $template->getName(),
            ];
        }

        foreach ($successTemplates as $template) {
            $templates['success'][] = [
                'id' => $template->getFileName(),
                'name' => $template->getName(),
            ];
        }

        if (!$this->getSettingsService()->getSettingsModel()->defaultTemplates) {
            $templates['native'] = [];
        }

        $templates['default'] = $freeform->forms->getDefaultFormattingTemplate();

        return $this->asJson([
            'types' => $types,
            'statuses' => $statuses,
            'templates' => $templates,
            'ajax' => $freeform->settings->isAjaxEnabledByDefault(),
        ]);
    }

    public function actionIndex(): Response
    {
        $this->requirePostRequest();

        $post = $this->request->post();

        $state = [
            'composer' => [
                'layout' => [[]],
                'properties' => [
                    'page0' => [
                        'type' => 'page',
                        'label' => 'Page 1',
                    ],
                    'form' => [
                        'type' => 'form',
                        'name' => $post['name'],
                        'formType' => $post['type'] ?? Regular::class,
                        'handle' => $post['handle'],
                        'color' => $post['color'],
                        'submissionTitleFormat' => $post['submissionTitle'],
                        'description' => '',
                        'formTemplate' => $post['formTemplate'],
                        'returnUrl' => $post['returnUrl'],
                        'storeData' => (bool) $post['storeData'],
                        'ajaxEnabled' => $post['ajax'],
                        'defaultStatus' => $post['status'],
                    ],
                    'validation' => [
                        'type' => 'validation',
                        'validationType' => 'submit',
                        'successMessage' => '',
                        'errorMessage' => '',
                    ],
                    'integration' => [
                        'type' => 'integration',
                        'integrationId' => 0,
                        'mapping' => new \stdClass(),
                    ],
                    'connections' => [
                        'type' => 'connections',
                        'list' => null,
                    ],
                    'rules' => [
                        'type' => 'rules',
                        'list' => new \stdClass(),
                    ],
                    'admin_notifications' => [
                        'type' => 'admin_notifications',
                        'notificationId' => 0,
                        'recipients' => '',
                    ],
                    'payment' => [
                        'type' => 'payment',
                        'integrationId' => 0,
                        'mapping' => new \stdClass(),
                    ],
                ],
            ],
            'context' => [
                'page' => 0,
                'hash' => 'form',
            ],
        ];

        $formModel = FormModel::create();
        $formModel->type = $post['type'] ?? Regular::class;

        $metadata = array_filter([
            'successBehaviour' => $post['successBehaviour'] ?? null,
            'successTemplate' => $post['successTemplate'] ?? '',
        ]);

        $formModel->metadata = $metadata;

        try {
            $composer = new Composer(
                $formModel,
                $state,
                new CraftTranslator(),
                FreeformLogger::getInstance(FreeformLogger::FORM)
            );
        } catch (ComposerException $exception) {
            $this->response->setStatusCode(400);

            return $this->asJson(['errors' => [$exception->getMessage()]]);
        }

        $formModel->setLayout($composer);

        $formsService = Freeform::getInstance()->forms;
        if ($formsService->save($formModel)) {
            $this->response->setStatusCode(201);

            return $this->asJson([
                'id' => $formModel->id,
                'handle' => $formModel->handle,
            ]);
        }

        $this->response->setStatusCode(400);

        return $this->asJson(['errors' => $formModel->getErrors()]);
    }
}
