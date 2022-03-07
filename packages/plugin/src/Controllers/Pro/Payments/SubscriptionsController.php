<?php

namespace Solspace\Freeform\Controllers\Pro\Payments;

use Solspace\Freeform\Controllers\BaseController;
use Solspace\Freeform\Freeform;

//TODO: create abstract controller
class SubscriptionsController extends BaseController
{
    public $enableCsrfValidation = false;

    protected array|bool|int $allowAnonymous = true;

    public function actionCancel(int $id, string $validationKey): string
    {
        //TODO: encrypt id
        //TODO: expose json?
        $subscription = $this->getPaymentsSubscriptionsService()->getById($id);
        if (!$subscription) {
            return $this->renderResponse(Freeform::t('Subscription not found'));
        }

        $generatedKey = sha1($subscription->resourceId);

        if ($validationKey != $generatedKey) {
            return $this->renderResponse(Freeform::t('Subscription not found'));
        }

        $result = $subscription->getIntegration()->cancelSubscription($subscription->resourceId);
        if (true !== $result) {
            return $this->renderResponse(Freeform::t('Error during subscription cancellation'));
        }

        return $this->renderResponse();
    }

    protected function renderResponse(string $error = ''): string
    {
        $isAjax = \Craft::$app->getRequest()->isAjax;

        if ($error) {
            return $isAjax ? $this->asJson(['success' => false, 'error' => $error]) : $error;
        }

        return $isAjax ? $this->asJson(['success' => true]) : Freeform::t('Unsubscribed successfully');
    }
}
