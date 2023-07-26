<?php

namespace Solspace\Freeform\controllers\integrations;

use craft\helpers\UrlHelper;
use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMOAuthConnector;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\MailingListOAuthConnector;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class OAuthController extends BaseController
{
    public function actionAuthorize(): Response
    {
        $integrationsService = $this->getIntegrationsService();

        $code = $this->request->get('code');
        if (!$code) {
            throw new NotFoundHttpException('Code not present');
        }

        $integrationId = (int) $this->request->get('state', 0);
        $model = $integrationsService->getById($integrationId);
        if (!$model) {
            throw new NotFoundHttpException('Integration not found');
        }

        $integration = $model->getIntegrationObject();
        if (!$integration instanceof CRMOAuthConnector && !$integration instanceof MailingListOAuthConnector) {
            throw new NotFoundHttpException('Integration does not implement authorizable interface');
        }

        $type = $integrationsService->getIntegrationType($integration);
        $integration->fetchTokens($code);

        try {
            $integration->onBeforeSave();
        } catch (\Exception $e) {
            $model->addError('integration', $e->getMessage());
        }

        $integrationsService->updateModelFromIntegration($model, $integration);

        if ($integrationsService->save($model)) {
            \Craft::$app->session->setNotice(Freeform::t('Integration saved'));

            return $this->redirect(UrlHelper::cpUrl('freeform/settings/'.$type.'/'.$integration->getId()));
        }

        \Craft::$app->session->setError(Freeform::t('Integration not saved'));

        return $this->redirect(UrlHelper::cpUrl('freeform/settings/'.$type.'/'.$integration->getId()));
    }
}
