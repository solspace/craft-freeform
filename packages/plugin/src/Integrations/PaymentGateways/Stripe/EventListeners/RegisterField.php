<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\EventListeners;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Fields\Types\RegisterFieldTypesEvent;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\ResponseHelper;
use yii\base\Event;

class RegisterField extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
    ) {
        Event::on(
            FieldTypesProvider::class,
            FieldTypesProvider::EVENT_REGISTER_FIELD_TYPES,
            [$this, 'registerFieldTypes']
        );

        Event::on(
            Form::class,
            Form::EVENT_RENDER_AFTER_CLOSING_TAG,
            [$this, 'attachStripeScripts']
        );
    }

    public function registerFieldTypes(RegisterFieldTypesEvent $event): void
    {
        $event->addType(StripeField::class);
    }

    public function attachStripeScripts(RenderTagEvent $event): void
    {
        $form = $event->getForm();
        if (!$form->getFields()->hasFieldOfClass(StripeField::class)) {
            return;
        }

        $integrations = $this->integrationsProvider->getForForm($form, Type::TYPE_PAYMENT_GATEWAYS);

        /** @var Stripe $integration */
        $integration = reset($integrations);
        if (!$integration || !$integration->isEnabled()) {
            return;
        }

        $event->addChunk('<script src="https://js.stripe.com/v3/"></script>');

        $scriptPath = \Craft::getAlias('@freeform-scripts/front-end/payments/stripe/elements.js');
        $script = file_get_contents($scriptPath);

        $config = json_encode([
            'formId' => $form->getAnchor(),
            'apiKey' => $integration->getPublicKey(),
            'fieldMapping' => $integration->getMappedFieldHandles($form),
            'csrf' => [
                'name' => \Craft::$app->getConfig()->general->csrfTokenName,
                'value' => \Craft::$app->request->csrfToken,
            ],
        ]);

        $chunk = <<<SCRIPT
            <script id="ff-conf-{$form->getAnchor()}" class="freeform-stripe-config" type="application/json">{$config}</script>
            <script class="freeform-stripe-script" type="text/javascript">{$script}</script>
        SCRIPT;

        $event->addChunk($chunk, ['formId' => $form->getAnchor()]);
    }
}
