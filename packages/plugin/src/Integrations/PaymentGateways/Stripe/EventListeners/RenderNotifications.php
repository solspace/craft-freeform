<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\EventListeners;

use Solspace\Freeform\Events\Mailer\RenderEmailEvent;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services\StripePaymentService;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\MailerService;
use yii\base\Event;

class RenderNotifications extends FeatureBundle
{
    public function __construct(private StripePaymentService $paymentService)
    {
        Event::on(
            MailerService::class,
            MailerService::EVENT_BEFORE_RENDER,
            [$this, 'prepareTemplateValues']
        );
    }

    public function prepareTemplateValues(RenderEmailEvent $event): void
    {
        $form = $event->getForm();

        $fields = $form->getLayout()->getFields(StripeField::class);
        if (!$fields->count()) {
            return;
        }

        $payments = [];

        /** @var StripeField $field */
        foreach ($fields as $field) {
            $paymentIntentId = $field->getValue();
            if (!$paymentIntentId) {
                continue;
            }

            $intent = $field
                ->getIntegration()
                ->getStripeClient()
                ->paymentIntents
                ->retrieve(
                    $paymentIntentId,
                    ['expand' => ['customer', 'payment_method', 'invoice.subscription.plan.product']]
                )
            ;

            if ($intent) {
                $payments[$field->getHandle()] = $this->paymentService->intentToModel($field, $intent);
            }
        }

        if (1 === \count($payments)) {
            $payments = reset($payments);
        }

        $event->add('payments', $payments);
    }
}
