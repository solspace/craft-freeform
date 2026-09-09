<?php

namespace Solspace\Freeform\controllers\api\headless;

use craft\web\Response;
use yii\web\NotFoundHttpException;

class ManifestController extends BaseHeadlessController
{
    public function actionGet(string $handle): Response
    {
        $this->getHeadlessAccessService()->requireEnabled();

        $form = $this->getFormsService()->getFormByHandle($handle);
        if (!$form) {
            throw new NotFoundHttpException(\sprintf('Form "%s" not found.', $handle));
        }

        $this->getHeadlessAccessService()->requireManifestAccess($form);

        $manifest = $this->getManifestService()->buildPublicManifest($form);
        $response = $this->asHeadlessJson($this->getResponseHelper()->success($manifest));
        $this->getResponseHelper()->applyPublicManifestCache($response, $form);

        return $response;
    }
}
