<?php

namespace Solspace\Freeform\controllers\integrations;

use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\controllers\PopUpTrait;
use Solspace\Freeform\Events\Integrations\AuthorizeIntegrationEvent;
use Solspace\Freeform\Freeform;
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
        $model = $this->getIntegrationsService()->getById($id);
        if (!$model) {
            throw new NotFoundHttpException('Integration not found');
        }

        try {
            $integration = $model->getIntegrationObject();
            $event = new AuthorizeIntegrationEvent($model, $integration);
            Event::trigger(
                APIIntegrationInterface::class,
                APIIntegrationInterface::EVENT_TRIGGER_AUTHORIZE,
                $event
            );
            if ($event->hasErrors()) {
                return $this->renderPopUpError($event->getErrors());
            }

            $this->getIntegrationsService()->setConnectionEstablished($integration);
        } catch (\Throwable $e) {
            $this->getLoggerService()->getLogger('oauth', 'freeform-integrations.log')->error(
                'Integration authorization could not start',
                ['integrationId' => $id, 'exceptionClass' => $e::class]
            );

            return $this->renderPopUpError(
                $e instanceof IntegrationException
                    ? $e->getMessage()
                    : Freeform::t('Authorization could not be completed. Check the integration settings and the Freeform integration log, then try again.')
            );
        }

        return $this->closePopUpWindowResponse();
    }
}
