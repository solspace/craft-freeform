<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\Freeform;
use yii\web\Response;

class ModalController extends BaseController
{
    public function init(): void
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

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
}
