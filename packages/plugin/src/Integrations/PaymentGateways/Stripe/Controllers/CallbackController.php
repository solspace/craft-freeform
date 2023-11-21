<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;
use Solspace\Freeform\Records\SavedFormRecord;
use Solspace\Freeform\Services\SubmissionsService;
use Stripe\PaymentIntent;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class CallbackController extends BaseStripeController
{
    protected array|bool|int $allowAnonymous = ['callback'];

    public function __construct(
        $id,
        $module,
        $config = [],
        private IsolatedTwig $isolatedTwig,
        private SubmissionsService $submissionsService,
    ) {
        parent::__construct($id, $module, $config);
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
}
