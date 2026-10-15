<?php

namespace Solspace\Freeform\controllers\api\headless;

use craft\elements\User;
use craft\web\Response;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\Headless\Profile\ContextProviderInterface;
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

        $valueOverrides = $this->resolveProtectedFieldOverrides(
            $form,
            $access['provider'],
            $access['properties'],
        );

        $payload = $this->getHeadlessSubmitService()->submit(
            $form,
            \Craft::$app->getRequest(),
            $valueOverrides,
        );

        $status = 200;
        if (!$payload['success']) {
            $status = 'not_implemented' === ($payload['status'] ?? '') ? 501 : 422;
        }

        $response = $this->asJson($payload);
        $response->setStatusCode($status);
        $this->getResponseHelper()->applyNoStore($response);

        return $response;
    }

    /**
     * Hidden / locked profile fields must use provider defaults — clients cannot
     * invent those values on submit.
     *
     * @param array<string, mixed> $properties
     *
     * @return array<string, mixed>
     */
    private function resolveProtectedFieldOverrides(
        Form $form,
        ?ContextProviderInterface $provider,
        array $properties,
    ): array {
        if (!$provider) {
            return [];
        }

        $user = $this->currentUser();
        $defaults = $provider->getDefaultValues($form, $properties, $user);
        $protected = array_unique(array_merge(
            $provider->getHiddenFieldHandles($form, $properties, $user),
            $provider->getLockedFieldHandles($form, $properties, $user),
        ));

        $overrides = [];
        foreach ($protected as $handle) {
            if (\array_key_exists($handle, $defaults)) {
                $overrides[$handle] = $defaults[$handle];
            }
        }

        return $overrides;
    }

    private function currentUser(): ?User
    {
        $identity = \Craft::$app->getUser()->getIdentity();

        return $identity instanceof User ? $identity : null;
    }
}
