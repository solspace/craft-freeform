<?php

namespace Solspace\Freeform\controllers\api\headless;

use craft\web\Response;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Library\Helpers\HashHelper;
use Solspace\Freeform\Services\Headless\HeadlessDraftService;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;

class StripePaymentController extends BaseHeadlessController
{
    public function actionCheckpoint(string $handle): Response
    {
        $this->requirePostRequest();
        $this->getHeadlessAccessService()->requireEnabled();

        $form = $this->getFormsService()->getFormByHandle($handle);
        if (!$form) {
            throw new NotFoundHttpException(\sprintf('Form "%s" not found.', $handle));
        }
        $this->getHeadlessAccessService()->requireSubmitAccess($form);

        $payload = \Craft::$app->getRequest()->getBodyParams();
        if ([] === $payload && \Craft::$app->getRequest()->getIsJson()) {
            $payload = json_decode(\Craft::$app->getRequest()->getRawBody(), true) ?: [];
        }

        $integrationHash = $payload['integration'] ?? null;
        $paymentIntentId = $payload['paymentIntentId'] ?? null;
        if (!\is_string($integrationHash) || !\is_string($paymentIntentId)) {
            throw new BadRequestHttpException('Missing Stripe payment checkpoint details.');
        }

        $ids = HashHelper::decodeMultiple($integrationHash);
        [$formId, $integrationId, $fieldId] = [
            (int) ($ids[0] ?? 0),
            (int) ($ids[1] ?? 0),
            (int) ($ids[2] ?? 0),
        ];
        if ($formId !== $form->getId()) {
            throw new ForbiddenHttpException('Stripe payment does not belong to this form.');
        }

        $field = $form->getLayout()->getFields()->get($fieldId);
        if (!$field instanceof StripeField || $field->getIntegration()?->getId() !== $integrationId) {
            throw new ForbiddenHttpException('Stripe payment integration is not valid for this form.');
        }

        $validation = $this->getHeadlessSubmitService()->validateForPayment(
            $form,
            \Craft::$app->getRequest(),
        );
        if (!$validation['success']) {
            $response = $this->asJson($validation);
            $response->setStatusCode(422);
            $this->getResponseHelper()->applyNoStore($response);

            return $response;
        }

        $paymentIntent = $field->getIntegration()
            ->getStripeClient()
            ->paymentIntents
            ->retrieve($paymentIntentId)
        ;
        if (($paymentIntent->metadata->hash ?? null) !== $integrationHash || !$paymentIntent->client_secret) {
            throw new ForbiddenHttpException('Stripe payment could not be verified.');
        }

        $saved = \Craft::$container
            ->get(HeadlessDraftService::class)
            ->savePaymentCheckpoint($form, $paymentIntent->id, $paymentIntent->client_secret)
        ;
        if (!$saved) {
            throw new BadRequestHttpException('Unable to save the payment checkpoint.');
        }

        $response = $this->asJson($this->getResponseHelper()->success([
            'paymentIntentId' => $paymentIntent->id,
        ]));
        $this->getResponseHelper()->applyNoStore($response);

        return $response;
    }
}
