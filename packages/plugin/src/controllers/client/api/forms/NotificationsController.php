<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\controllers\client\api\forms;

use Solspace\Freeform\Bundles\Notifications\Providers\FormNotificationsProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationDTOProvider;
use Solspace\Freeform\controllers\BaseApiController;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class NotificationsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private FormNotificationsProvider $formNotificationsProvider,
        private NotificationDTOProvider $notificationDTOProvider
    ) {
        parent::__construct($id, $module, $config ?? []);
    }

    public function actionGet(int $formId): Response
    {
        $form = $this->getFormsService()->getFormById($formId);

        $models = $this->formNotificationsProvider->getForForm($form);
        $dtos = $this->notificationDTOProvider->convert($models);

        return $this->asJson($dtos);
    }

    /**
     * @throws NotFoundHttpException
     */
    public function actionGetOne(int $formId, int $id): Response
    {
        $form = $this->getFormsService()->getFormById($formId);
        if (!$form) {
            throw new NotFoundHttpException("Form with ID {$formId} not found");
        }

        $dto = $this->notificationDTOProvider->getById($id);
        if (!$dto) {
            return $this->asJson(null);
        }

        return $this->asJson($dto);
    }
}
