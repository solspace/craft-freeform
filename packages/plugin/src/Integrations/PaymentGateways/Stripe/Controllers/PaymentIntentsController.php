<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services\StripeCustomerService;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services\StripePriceService;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class PaymentIntentsController extends BaseStripeController
{
    protected array|bool|int $allowAnonymous = ['payment-intents'];

    public function __construct(
        $id,
        $module,
        $config = [],
        private IsolatedTwig $isolatedTwig,
        private StripeCustomerService $customerService,
        private StripePriceService $amountService,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionUpdateAmount(?string $paymentIntentId): Response
    {
        try {
            [$form, $integration, $field] = $this->getRequestItems();
        } catch (NotFoundHttpException $exception) {
            return $this->asSerializedJson(['errors' => [$exception->getMessage()]], 404);
        }

        if (!$paymentIntentId) {
            throw new NotFoundHttpException('Payment Intent not found');
        }

        $amount = $this->amountService->getAmount($form, $field);

        $stripe = $integration->getStripeClient();
        $paymentIntent = $stripe
            ->paymentIntents
            ->retrieve($paymentIntentId, ['expand' => ['invoice.subscription']])
        ;

        if ($paymentIntent->invoice) {
            $price = $this->amountService->getPrice($field, $form, $integration);

            $subscription = $paymentIntent->invoice->subscription;
            $subscription->cancel();

            $newSubscription = $stripe
                ->subscriptions
                ->create(
                    [
                        'customer' => $subscription->customer,
                        'description' => $subscription->description,
                        'metadata' => $subscription->metadata->toArray(),
                        'payment_behavior' => 'default_incomplete',
                        'items' => [['price' => $price->id]],
                        'payment_settings' => [
                            'save_default_payment_method' => 'on_subscription',
                        ],
                        'expand' => ['latest_invoice.payment_intent'],
                    ]
                )
            ;

            return $this->asSerializedJson([
                'id' => $newSubscription->latest_invoice->payment_intent->id,
                'client_secret' => $newSubscription->latest_invoice->payment_intent->client_secret,
                'amount' => $amount,
            ], 201);
        }
        $stripe->paymentIntents->update($paymentIntentId, ['amount' => $amount]);

        return $this->asSerializedJson([
            'amount' => $amount,
        ]);
    }

    public function actionCreate(): Response
    {
        try {
            [$form, $integration, $field] = $this->getRequestItems();
        } catch (NotFoundHttpException $exception) {
            return $this->asSerializedJson(['errors' => [$exception->getMessage()]], 404);
        }

        $stripe = $integration->getStripeClient();

        $description = $this->isolatedTwig
            ->render(
                $field->getDescription(),
                [
                    'form' => $field->getForm(),
                    'field' => $field,
                ]
            )
        ;

        $metadata = [
            'formId' => $form->getId(),
            'formName' => $form->getName(),
            'formLink' => UrlHelper::cpUrl('freeform/forms/'.$form->getId()),
            'fieldId' => $field->getId(),
            'fieldName' => $field->getLabel(),
            'integrationId' => $integration->getId(),
            'integrationName' => $integration->getName(),
            'integrationLink' => UrlHelper::cpUrl(
                'freeform/settings/integrations/payment-gateways/'.$integration->getId()
            ),
        ];

        $data = $integration->getMappedFieldValues($form);
        $customer = $this->customerService->getOrCreateCustomer(
            $integration,
            null,
            $data,
        );

        $content = ['customerId' => $customer->id];

        if (StripeField::PAYMENT_TYPE_SUBSCRIPTION === $field->getPaymentType()) {
            $price = $this->amountService->getPrice($field, $form, $integration);

            $subscription = $stripe
                ->subscriptions
                ->create([
                    'customer' => $customer->id,
                    'items' => [['price' => $price->id]],
                    'description' => $description,
                    'metadata' => $metadata,
                    'payment_behavior' => 'default_incomplete',
                    'payment_settings' => [
                        'save_default_payment_method' => 'on_subscription',
                    ],
                    'expand' => ['latest_invoice.payment_intent'],
                ])
            ;

            $id = $subscription->latest_invoice->payment_intent->id;
            $secret = $subscription->latest_invoice->payment_intent->client_secret;
        } else {
            $amount = $this->amountService->getAmount($form, $field);
            $currency = $field->getCurrency();

            $paymentIntent = $stripe
                ->paymentIntents
                ->create([
                    'customer' => $customer->id,
                    'amount' => $amount,
                    'currency' => $currency,
                    // 'payment_method_types' => ['card', 'ideal', 'paypal'],
                    'automatic_payment_methods' => [
                        'enabled' => true,
                    ],
                    'description' => $description,
                    'metadata' => $metadata,
                ])
            ;

            $id = $paymentIntent->id;
            $secret = $paymentIntent->client_secret;
        }

        $content['id'] = $id;
        $content['secret'] = $secret;

        return $this->asSerializedJson($content, 201);
    }
}
