<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use Solspace\Freeform\Library\Helpers\HashHelper;
use yii\web\NotFoundHttpException;

abstract class BaseStripeController extends BaseApiController
{
    /**
     * @return array{ 0: Form, 1: Stripe, 2: StripeField, 3: string, 4: null|array }
     */
    protected function getRequestItems(?string $hash = null): array
    {
        $logger = $this->getLoggerService()->getLogger('Stripe');

        if (!$hash) {
            $hash = $this->request->getHeaders()->get('FF-STRIPE-INTEGRATION');
            if (!$hash) {
                $hash = $this->request->get('integration');
            }
        }

        if (!$hash) {
            $logger->warning('Did not find integration hash in the request.');

            throw new NotFoundHttpException('Integration not found');
        }

        $ids = HashHelper::decodeMultiple($hash);

        $formId = $ids[0] ?? 0;
        $integrationId = $ids[1] ?? 0;
        $fieldId = $ids[2] ?? 0;

        $form = $this->getFormsService()->getFormById($formId);
        if (!$form) {
            $logger->warning('Could not find Form from the request', ['formId' => $formId]);

            throw new NotFoundHttpException('Form not found');
        }

        $form->disableFunctionality(['captchas']);
        $form->handleRequest($this->request, true);
        $this->applyPaymentFieldValues($form);

        /** @var Stripe $integration */
        $integrations = $this->getIntegrationsService()->getForForm($form, Type::TYPE_PAYMENT_GATEWAYS);

        $integration = null;
        foreach ($integrations as $int) {
            if ($int->getId() === $integrationId) {
                $integration = $int;

                break;
            }
        }

        if (null === $integration) {
            $logger->warning('Could not find Integration from the request', ['integrationId' => $integrationId]);

            throw new NotFoundHttpException('Integration not found');
        }

        /** @var StripeField $field */
        $field = $form->getLayout()->getFields()->get($fieldId);
        if (null === $field) {
            $logger->warning('Could not find Stripe Form Field from the request', ['fieldId' => $fieldId]);

            throw new NotFoundHttpException('Field Not Found');
        }

        $opts = null;
        $idempotencyKey = $this->request->getBodyParam('idempotencyKey');
        if ($idempotencyKey) {
            $opts = ['idempotency_key' => $idempotencyKey];
        }

        return [$form, $integration, $field, $hash, $opts];
    }

    /**
     * Apply posted field values so dynamic amount/interval fields are available
     * when creating or updating PaymentIntents. Classic Freeform sessions may
     * already populate values; headless SPAs send them explicitly.
     */
    private function applyPaymentFieldValues(Form $form): void
    {
        $values = [];
        $bodyParams = $this->request->getBodyParams();
        if (\is_array($bodyParams['values'] ?? null)) {
            $values = $bodyParams['values'];
        } else {
            $raw = json_decode($this->request->getRawBody() ?: '', true);
            if (\is_array($raw['values'] ?? null)) {
                $values = $raw['values'];
            } else {
                foreach ($form->getLayout()->getFields() as $formField) {
                    $handle = $formField->getHandle();
                    if (!$handle) {
                        continue;
                    }

                    $posted = $this->request->getBodyParam($handle);
                    if (null !== $posted) {
                        $values[$handle] = $posted;
                    }
                }
            }
        }

        foreach ($values as $handle => $value) {
            if (!\is_string($handle) || '' === $handle) {
                continue;
            }

            $formField = $form->get($handle);
            if ($formField) {
                $formField->setValue($value);
            }
        }
    }
}
