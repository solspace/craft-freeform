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
use Solspace\Freeform\Records\IntegrationRecord;
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
            Form::EVENT_RENDER_BEFORE_CLOSING_TAG,
            [$this, 'attachStripeScripts']
        );
    }

    public function registerFieldTypes(RegisterFieldTypesEvent $event): void
    {
        $hasStripe = IntegrationRecord::find()
            ->where(['class' => Stripe::class])
            ->count()
        ;

        if ($hasStripe) {
            $event->addType(StripeField::class);
        }
    }

    public function attachStripeScripts(RenderTagEvent $event): void
    {
        static $stripeScriptLoaded;

        if (!$event->isGenerateTag()) {
            return;
        }

        $form = $event->getForm();
        if (!$form->getFields()->hasFieldOfClass(StripeField::class)) {
            return;
        }

        $integrations = $this->integrationsProvider->getForForm($form, Type::TYPE_PAYMENT_GATEWAYS);

        $hasIntegration = false;
        foreach ($integrations as $integration) {
            if ($integration instanceof Stripe && $integration->isEnabled()) {
                $hasIntegration = true;

                break;
            }
        }

        if (!$hasIntegration) {
            return;
        }

        if (null === $stripeScriptLoaded) {
            $stripeScriptLoaded = true;

            $scriptPath = \Craft::getAlias('@freeform-scripts/front-end/payments/stripe/elements.js');
            $event->addScript($scriptPath, 'freeform/scripts/stripe.js', ['class' => 'freeform-stripe-script']);
        }
    }
}
