<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\EventListeners;

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
        if (!$event->isGenerateTag()) {
            return;
        }

        $scriptPath = 'js/scripts/front-end/payments/stripe/elements.js';
        $attributes = ['class' => 'freeform-stripe-script'];

        if ($event->isCollectAllScripts()) {
            $event->addScript($scriptPath, $attributes);

            return;
        }

        $form = $event->getForm();
        if (!$form->getFields()->hasFieldOfClass(StripeField::class)) {
            return;
        }

        $integration = $this->integrationsProvider->getFirstForForm($form, Stripe::class);
        if (!$integration) {
            return;
        }

        $event->addScript($scriptPath, $attributes);
    }
}
