<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class PaymentIntentsController extends BaseApiController
{
    protected array|bool|int $allowAnonymous = ['payment-intents'];

    public function __construct($id, $module, $config = [], private IsolatedTwig $isolatedTwig)
    {
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

    private function createPaymentIntent(Form $form, Stripe $integration, StripeField $field): Response
    {
        $description = $this->isolatedTwig->render($field->getDescription(), [
            'form' => $field->getForm(),
            'field' => $field,
        ]);

        $paymentIntent = $integration
            ->getStripeClient()
            ->paymentIntents
            ->create([
                'amount' => $field->getAmount() * 100,
                'currency' => $field->getCurrency(),
                'payment_method_types' => ['card', 'ideal'],
                // 'automatic_payment_methods' => [
                //     'enabled' => true,
                // ],
                'description' => $description,
                'metadata' => [
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
                ],
            ])
        ;

        $content = [
            'id' => $paymentIntent->id,
            'secret' => $paymentIntent->client_secret,
        ];

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

    private function getRequestItems(): array
    {
        $ids = Stripe::getHashids()->decode($this->request->post('integration'));

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
}
