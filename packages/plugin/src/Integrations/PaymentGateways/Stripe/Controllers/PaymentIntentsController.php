<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use yii\web\Response;

class PaymentIntentsController extends BaseApiController
{
    protected array|bool|int $allowAnonymous = ['create-payment-intent'];

    public function actionCreatePaymentIntent(): Response
    {
        $ids = Stripe::getHashids()->decode($this->request->post('integration'));

        $formId = $ids[0] ?? 0;
        $integrationId = $ids[1] ?? 0;
        $fieldId = $ids[2] ?? 0;

        $form = $this->getFormsService()->getFormById($formId);
        if (!$form) {
            return $this->asSerializedJson(['errors' => ['Form not found']], 404);
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
            return $this->asSerializedJson(['errors' => ['Integration not found']], 404);
        }

        /** @var StripeField $field */
        $field = $form->getFields()->get($fieldId);
        if (null === $field) {
            return $this->asSerializedJson(['errors' => ['Field not found']], 404);
        }

        $twig = new IsolatedTwig();

        $description = $twig->render($field->getDescription(), [
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
            'paymentIntentId' => $paymentIntent->id,
            'clientSecret' => $paymentIntent->client_secret,
        ];

        return $this->asSerializedJson($content, 201);
    }
}
