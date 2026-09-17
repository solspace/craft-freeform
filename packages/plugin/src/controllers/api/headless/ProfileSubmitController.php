<?php

namespace Solspace\Freeform\controllers\api\headless;

use craft\web\Response;
use Solspace\Freeform\Services\Headless\Profile\ProfileAccessService;
use yii\web\NotFoundHttpException;

class ProfileSubmitController extends BaseHeadlessController
{
    public function actionPost(string $profile): Response
    {
        $this->requirePostRequest();
        $this->getHeadlessAccessService()->requireEnabled();

        $access = \Craft::$container->get(ProfileAccessService::class)->authorizeSubmit($profile);
        $headlessProfile = $access['profile'];
        $form = $this->getFormsService()->getFormByHandle($headlessProfile->formHandle);

        if (!$form) {
            throw new NotFoundHttpException(\sprintf('Form "%s" not found.', $headlessProfile->formHandle));
        }

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
