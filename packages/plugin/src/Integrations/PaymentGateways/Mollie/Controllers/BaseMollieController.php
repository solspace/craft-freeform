<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie\Controllers;

use GuzzleHttp\Client;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Fields\MollieField;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Mollie;
use Solspace\Freeform\Library\Helpers\HashHelper;
use yii\web\NotFoundHttpException;

abstract class BaseMollieController extends BaseApiController
{
    protected function getRequestItems(?string $hash = null): array
    {
        if (!$hash) {
            $hash = $this->request->get('integration');
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
        $form->handleRequest($this->request, true);

        $field = $form->getLayout()->getFields()->get($fieldId);
        if (!$field instanceof MollieField) {
            throw new NotFoundHttpException('Mollie field not found');
        }

        $integration = $field->getIntegration();
        if (!$integration instanceof Mollie) {
            throw new NotFoundHttpException('Mollie integration not found');
        }

        return [$form, $integration, $field];
    }

    protected function getClient(): Client
    {
        return new Client([
            'timeout' => 30,
            'connect_timeout' => 10,
        ]);
    }
}
