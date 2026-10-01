<?php

namespace Solspace\Freeform\controllers\api\headless;

use craft\web\Response;
use Solspace\Freeform\Services\Headless\Profile\ProfileAccessService;
use yii\web\NotFoundHttpException;

class ProfileManifestController extends BaseHeadlessController
{
    public function actionGet(string $profile): Response
    {
        $this->getHeadlessAccessService()->requireEnabled();

        $access = \Craft::$container->get(ProfileAccessService::class)->authorizeManifest($profile);
        $headlessProfile = $access['profile'];
        $form = $this->getFormsService()->getFormByHandle($headlessProfile->formHandle);

        if (!$form) {
            throw new NotFoundHttpException(\sprintf('Form "%s" not found.', $headlessProfile->formHandle));
        }

        $manifest = $this->getManifestService()->buildProfileManifest(
            $form,
            $headlessProfile,
            $access['properties'],
            $access['provider'],
        );

        $response = $this->asHeadlessJson($this->getResponseHelper()->success($manifest));
        $this->getResponseHelper()->applyProfileManifestCache($response, $headlessProfile);

        return $response;
    }
}
