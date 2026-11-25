<?php

namespace Solspace\Freeform\controllers\api\forms;

use craft\db\Query;
use Solspace\Freeform\controllers\BaseCpApiController;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Records\FormTranslationRecord;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class TranslationsController extends BaseCpApiController
{
    public function actionGet(int $formId): Response
    {
        PermissionHelper::requireFormManagePermission($formId);

        $form = $this->getFormsService()->getFormById($formId);
        if (!$form) {
            throw new NotFoundHttpException("Form with ID {$formId} not found");
        }

        $translations = (new Query())
            ->select(['siteId', 'translations'])
            ->from(FormTranslationRecord::tableName())
            ->where(['formId' => $form->getId()])
            ->indexBy('siteId')
            ->all()
        ;

        return $this->asJson($translations);
    }
}
