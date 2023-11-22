<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services\StripeCallbackService;
use Solspace\Freeform\Records\SavedFormRecord;
use Stripe\Event;
use Stripe\PaymentIntent;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class StripeWebhookController extends BaseStripeController
{
    public $enableCsrfValidation = false;
    protected array|bool|int $allowAnonymous = ['webhooks'];

    public function __construct(
        $id,
        $module,
        $config = [],
        private StripeCallbackService $callbackService,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionWebhooks(): Response
    {
        $event = Event::constructFrom($this->request->post());

        return match ($event->type) {
            Event::PAYMENT_INTENT_SUCCEEDED => $this->handlePaymentIntentSucceeded($event),
            default => $this->asEmptyResponse(),
        };
    }

    protected function handlePaymentIntentSucceeded(Event $event): Response
    {
        /** @var PaymentIntent $paymentIntent */
        $paymentIntent = $event->data->object;

        $hash = $paymentIntent?->metadata?->hash;

        try {
            [$form, $integration, $field] = $this->getRequestItems($hash);
        } catch (NotFoundHttpException $exception) {
            return $this->asSerializedJson(['errors' => [$exception->getMessage()]], 404);
        }

        $savedForm = SavedFormRecord::findOne([
            'token' => $paymentIntent->id,
            'formId' => $form->getId(),
        ]);

        $this->callbackService->handleSavedForm(
            $form,
            $integration,
            $field,
            $paymentIntent,
            $savedForm,
        );

        return $this->asEmptyResponse();
    }
}
