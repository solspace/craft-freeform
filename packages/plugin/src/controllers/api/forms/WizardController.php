<?php

namespace Solspace\Freeform\controllers\api\forms;

use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Services\FormPreviewService;
use Solspace\Freeform\Services\FormWizardService;
use yii\web\Response;

class WizardController extends BaseApiController
{
    public function actionOptions(): Response
    {
        $this->guard();

        return $this->asJson(\Craft::$container->get(FormWizardService::class)->options());
    }

    public function actionPreview(): Response
    {
        $this->requirePostRequest();
        $this->guard();

        try {
            $form = \Craft::$container->get(FormWizardService::class)->preview($this->request->getBodyParams());

            return $this->asJson(\Craft::$container->get(FormPreviewService::class)->render($form));
        } catch (\InvalidArgumentException $exception) {
            $this->response->statusCode = 400;

            return $this->asJson(['message' => $exception->getMessage()]);
        }
    }

    public function actionCreate(): Response
    {
        $this->requirePostRequest();
        $this->guard();
        // A retry after a lost response must not create a second form.
        $token = $this->request->getBodyParam('requestToken');
        if (!\is_string($token) || !preg_match('/^[a-f0-9-]{36}$/', $token)) {
            $this->response->statusCode = 400;

            return $this->asJson(['message' => Freeform::t('Reopen guided setup and try again.')]);
        }
        $key = 'freeform-wizard:'.\Craft::$app->user->id.':'.$token;
        if (!\Craft::$app->mutex->acquire($key, 0)) {
            $this->response->statusCode = 409;

            return $this->asJson(['message' => Freeform::t('Your form is still being created. Please wait before trying again.')]);
        }

        try {
            $id = \Craft::$app->cache->get($key);
            if (!$id) {
                $form = \Craft::$container->get(FormWizardService::class)->create($this->request->getBodyParams());
                $id = $form->getId();
                \Craft::$app->cache->set($key, $id, 3600);
            }

            return $this->asJson(['id' => $id, 'handle' => $this->getFormsService()->getFormById($id)?->getHandle()]);
        } catch (\InvalidArgumentException $exception) {
            $this->response->statusCode = 400;

            return $this->asJson(['message' => $exception->getMessage()]);
        } finally {
            \Craft::$app->mutex->release($key);
        }
    }

    private function guard(): void
    {
        $this->requireCpRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_CREATE);
        $this->response->getHeaders()->set('Cache-Control', 'no-store, private');
    }
}
