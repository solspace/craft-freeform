<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal\Controllers;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Library\Helpers\HashHelper;
use yii\web\NotFoundHttpException;

abstract class BasePayPalController extends BaseApiController
{
    public $enableCsrfValidation = false;

    protected function getRequestItems(?string $hash = null, bool $handleFormRequest = false): array
    {
        if (!$hash) {
            $hash = $this->request->getHeaders()->get('FF-PAYPAL-INTEGRATION');
            if (!$hash) {
                $hash = $this->request->get('integration');
            }
        }

        if (!$hash) {
            throw new NotFoundHttpException('Integration not found');
        }

        $ids = HashHelper::decodeMultiple($hash);

        $formId = $ids[0] ?? 0;
        $integrationId = $ids[1] ?? 0;
        $fieldId = $ids[2] ?? 0;

        $form = $this->getFormsService()->getFormById($formId);
        if (!$form) {
            throw new NotFoundHttpException('Form not found');
        }

        $form->disableFunctionality(['captchas']);
        if ($handleFormRequest) {
            $form->handleRequest($this->request, true);
        }

        $integration = $this->getIntegrationsService()->getFirstForForm(
            $form,
            Type::TYPE_PAYMENT_GATEWAYS,
            true,
            filter: fn ($integration) => $integration->getId() === $integrationId,
        );

        if (null === $integration) {
            throw new NotFoundHttpException('Integration not found');
        }

        $field = $form->getLayout()->getFields()->get($fieldId);
        if (null === $field) {
            throw new NotFoundHttpException('Field Not Found');
        }

        return [$form, $integration, $field, $hash];
    }
}
