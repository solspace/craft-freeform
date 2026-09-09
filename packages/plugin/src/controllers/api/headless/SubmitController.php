<?php

namespace Solspace\Freeform\controllers\api\headless;

use craft\web\Response;
use yii\web\NotFoundHttpException;

class SubmitController extends BaseHeadlessController
{
    public function actionPost(string $handle): Response
    {
        $this->requirePostRequest();
        $this->getHeadlessAccessService()->requireEnabled();

        $form = $this->getFormsService()->getFormByHandle($handle);
        if (!$form) {
            throw new NotFoundHttpException(\sprintf('Form "%s" not found.', $handle));
        }

        $this->getHeadlessAccessService()->requireSubmitAccess($form);

        $payload = $this->getHeadlessSubmitService()->submit($form, \Craft::$app->getRequest());

        $status = 200;
        if (!$payload['success']) {
            $status = 'not_implemented' === ($payload['status'] ?? '') ? 501 : 422;
        }

        $response = $this->asJson($payload);
        $response->setStatusCode($status);
        $this->getResponseHelper()->applyNoStore($response);

        return $response;
    }
}
