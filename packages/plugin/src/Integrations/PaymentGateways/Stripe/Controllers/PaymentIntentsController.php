<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use Solspace\Freeform\Library\Helpers\HashHelper;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;
use Solspace\Freeform\Records\SavedFormRecord;
use Solspace\Freeform\Services\SubmissionsService;
use Stripe\PaymentIntent;
use Stripe\Price;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class PaymentIntentsController extends BaseApiController
{
    protected array|bool|int $allowAnonymous = ['payment-intents', 'callback'];

    public function __construct(
        $id,
        $module,
        $config = [],
        private IsolatedTwig $isolatedTwig,
        private SubmissionsService $submissionsService,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionPaymentIntents(?string $paymentIntentId): Response
    {
        try {
            [$form, $integration, $field] = $this->getRequestItems();
        } catch (NotFoundHttpException $exception) {
            return $this->asSerializedJson(['errors' => [$exception->getMessage()]], 404);
        }

        return match ($this->request->method) {
            'POST' => $this->createPaymentIntent($form, $integration, $field),
            'PATCH' => $this->updatePaymentIntent($paymentIntentId, $integration),
        };
    }

    public function actionCallback(): Response
    {
        try {
            [$form, $integration, $field] = $this->getRequestItems();
        } catch (NotFoundHttpException $exception) {
            return $this->asSerializedJson(['errors' => [$exception->getMessage()]], 404);
        }

        $request = $this->request;

        $token = $request->get('token');
        $paymentIntentId = $request->get('payment_intent');
        $redirectStatus = $request->get('redirect_status');

        if (!$token) {
            throw new NotFoundHttpException('Token not found');
        }

        if (!$paymentIntentId) {
            throw new NotFoundHttpException('Payment Intent not found');
        }

        $paymentIntent = $integration->getStripeClient()
            ->paymentIntents
            ->retrieve($paymentIntentId, ['expand' => ['payment_method', 'invoice.subscription']])
        ;

        $savedForm = SavedFormRecord::findOne([
            'token' => $token,
            'formId' => $form->getId(),
        ]);

        if (!$savedForm) {
            throw new NotFoundHttpException('Saved Form not found');
        }

        $payload = json_decode(
            \Craft::$app->security->decryptByKey(
                base64_decode($savedForm->payload),
                $paymentIntentId
            ),
            true
        );

        $form->quickLoad($payload);
        $this->submissionsService->handleSubmission($form);

        $type = null !== $paymentIntent->invoice ? 'subscription' : 'payment';

        if ($form->getSubmission()->id) {
            $savedForm->delete();

            $payment = new PaymentRecord();
            $payment->integrationId = $integration->getId();
            $payment->fieldId = $field->getId();
            $payment->submissionId = $form->getSubmission()->id;
            $payment->resourceId = $paymentIntent->id;
            $payment->type = $type;
            $payment->currency = $paymentIntent->currency;
            $payment->amount = $paymentIntent->amount;
            $payment->status = $paymentIntent->status;
            $payment->metadata = [
                'type' => $paymentIntent->payment_method->type,
                'details' => $paymentIntent->payment_method->{$paymentIntent->payment_method->type}->toArray(),
            ];
            $payment->save();

            $submissionMetadata = [
                'submissionId' => $form->getSubmission()->id,
                'submissionLink' => UrlHelper::cpUrl('freeform/submissions/'.$form->getSubmission()->id),
            ];

            if ($paymentIntent?->invoice?->subscription) {
                $integration
                    ->getStripeClient()
                    ->subscriptions
                    ->update(
                        $paymentIntent->invoice->subscription->id,
                        [
                            'metadata' => array_merge(
                                $paymentIntent->invoice->subscription->metadata->toArray(),
                                $submissionMetadata,
                            ),
                        ]
                    )
                ;
            } else {
                $integration
                    ->getStripeClient()
                    ->paymentIntents
                    ->update(
                        $paymentIntent->id,
                        [
                            'metadata' => array_merge(
                                $paymentIntent->metadata->toArray(),
                                $submissionMetadata,
                            ),
                        ]
                    )
                ;
            }
        }

        $defaultUrl = $form->getSettings()->getBehavior()->returnUrl;
        $successUrl = $field->getRedirectSuccess() ?: $defaultUrl;
        $failedUrl = $field->getRedirectFailed() ?: $defaultUrl;

        if (PaymentIntent::STATUS_SUCCEEDED === $paymentIntent->status) {
            return $this->redirect(
                $this->isolatedTwig->render($successUrl, [
                    'form' => $form,
                    'submission' => $form->getSubmission(),
                    'paymentIntent' => $paymentIntent,
                ])
            );
        }

        return $this->redirect(
            $this->isolatedTwig->render($failedUrl, [
                'form' => $form,
                'paymentIntent' => $paymentIntent,
            ])
        );
    }

    private function createPaymentIntent(Form $form, Stripe $integration, StripeField $field): Response
    {
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

        $customer = $stripe
            ->customers
            ->create([
                'name' => '',
                'email' => '',
            ])
        ;

        $content = [
            'customerId' => $customer->id,
        ];

        $amount = (int) ($field->getAmount() * 100);
        $currency = $field->getCurrency();

        if (StripeField::PAYMENT_TYPE_SUBSCRIPTION === $field->getPaymentType()) {
            $price = $this->getPrice($field, $form, $integration, $amount, $currency);

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
            $paymentIntent = $stripe
                ->paymentIntents
                ->create([
                    'customer' => $customer->id,
                    'amount' => $field->getAmount() * 100,
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

    private function updatePaymentIntent(?string $paymentIntentId, Stripe $integration): Response
    {
        if (!$paymentIntentId) {
            throw new NotFoundHttpException('Payment Intent not found');
        }

        $amount = (int) $this->request->post('amount');

        $paymentIntent = $integration
            ->getStripeClient()
            ->paymentIntents
            ->update(
                $paymentIntentId,
                [
                    'amount' => $amount,
                ],
            )
        ;

        $content = $paymentIntent;

        return $this->asSerializedJson($content, 200);
    }

    /**
     * @return array{ 0: Form, 1: Stripe, 2: StripeField }
     */
    private function getRequestItems(): array
    {
        $hash = $this->request->getHeaders()->get('FF-STRIPE-INTEGRATION');
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
            throw new NotFoundHttpException('Integration not found');
        }

        /** @var StripeField $field */
        $field = $form->getFields()->get($fieldId);
        if (null === $field) {
            throw new NotFoundHttpException('Field Not Found');
        }

        return [$form, $integration, $field];
    }

    private function getPrice(
        StripeField $field,
        Form $form,
        Stripe $integration,
        int $amount,
        string $currency,
    ): Price {
        $stripe = $integration->getStripeClient();

        $productName = $this->isolatedTwig->render(
            $field->getProductName(),
            [
                'form' => $form,
                'integration' => $integration,
            ],
        );

        $product = $stripe
            ->products
            ->search([
                'query' => "name: '{$productName}'",
                'limit' => 1,
            ])
            ->first()
        ;

        if (!$product) {
            $product = $stripe->products->create(['name' => $productName]);
        }

        $price = $stripe
            ->prices
            ->search([
                'query' => "product: '{$product->id}' and lookup_key: '{$amount}{$currency}'",
                'limit' => 1,
            ])
            ->first()
        ;

        if (!$price) {
            $price = $stripe
                ->prices
                ->create([
                    'product' => $product->id,
                    'unit_amount' => $amount,
                    'lookup_key' => "{$amount}{$currency}",
                    'currency' => $currency,
                    'recurring' => [
                        'interval' => $field->getInterval(),
                        'interval_count' => $field->getIntervalCount(),
                    ],
                ])
            ;
        }

        return $price;
    }
}
