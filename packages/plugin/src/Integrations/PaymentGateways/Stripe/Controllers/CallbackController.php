<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services\StripeCallbackService;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Records\SavedFormRecord;
use Stripe\PaymentIntent;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class CallbackController extends BaseStripeController
{
    protected array|bool|int $allowAnonymous = true;

    public function __construct(
        $id,
        $module,
        $config = [],
        private IsolatedTwig $isolatedTwig,
        private StripeCallbackService $callbackService,
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

        if (!$token) {
            throw new NotFoundHttpException('Token not found');
        }

        if (!$paymentIntentId) {
            throw new NotFoundHttpException('Payment Intent not found');
        }

        $paymentIntent = $integration->getStripeClient()
            ->paymentIntents
            ->retrieve(
                $paymentIntentId,
                ['expand' => ['payment_method', 'invoice.subscription']]
            )
        ;

        $savedForm = SavedFormRecord::findOne([
            'token' => $paymentIntent->id,
            'formId' => $form->getId(),
        ]);

        if (PaymentIntent::STATUS_SUCCEEDED !== $paymentIntent->status && $integration->isSuppressOnFail()) {
            $form->disableFunctionality(['notifications', 'api']);
        }

        $this->callbackService->handleSavedForm(
            $form,
            $integration,
            $field,
            $paymentIntent,
            $savedForm,
        );

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
