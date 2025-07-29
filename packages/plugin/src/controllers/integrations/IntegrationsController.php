<?php

namespace Solspace\Freeform\controllers\integrations;

use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\controllers\PopUpTrait;
use Solspace\Freeform\Events\Integrations\AuthorizeIntegrationEvent;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\APIIntegrationInterface;
use yii\base\Event;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class IntegrationsController extends BaseController
{
    use PopUpTrait;

    public function init(): void
    {
        if (!\Craft::$app->request->getIsConsoleRequest()) {
            $this->requireLogin();
        }

        parent::init();
    }

    public function actionAuthorize(int $id): Response
    {
        try {
            $integration = $this->getIntegrationsService()->getIntegrationObjectById($id);
        } catch (IntegrationException) {
            throw new NotFoundHttpException('Integration not found');
        }

        $event = new AuthorizeIntegrationEvent($integration);

        try {
            Event::trigger(
                APIIntegrationInterface::class,
                APIIntegrationInterface::EVENT_TRIGGER_AUTHORIZE,
                $event
            );
        } catch (\Exception $e) {
            $event->addError($e->getMessage());
        }

        if ($event->hasErrors()) {
            return $this->renderPopUpError($event->getErrors());
        }

        $this->getIntegrationsService()->setConnectionEstablished($integration);

        return $this->closePopUpWindowResponse();
    }
}
