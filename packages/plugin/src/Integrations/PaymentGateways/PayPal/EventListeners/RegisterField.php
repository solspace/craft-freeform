<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal\EventListeners;

use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Fields\Types\RegisterFieldTypesEvent;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\CollectScriptsEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Fields\PayPalField;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\PayPal;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
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
            [$this, 'attachScripts']
        );

        Event::on(
            Form::class,
            Form::EVENT_COLLECT_SCRIPTS,
            [$this, 'collectScripts']
        );
    }

    public function registerFieldTypes(RegisterFieldTypesEvent $event): void
    {
        $hasPayPal = Freeform::getInstance()
            ->integrations
            ->isIntegrationInstalled(PayPal::class)
        ;

        if ($hasPayPal) {
            $event->addType(PayPalField::class);
        }
    }

    public function attachScripts(RenderTagEvent $event): void
    {
        if (!$event->isGenerateTag()) {
            return;
        }

        $form = $event->getForm();
        if (!$form->getFields()->hasFieldOfClass(PayPalField::class)) {
            return;
        }

        $integration = $this->integrationsProvider->getFirstForForm($form, PayPal::class);
        if (!$integration) {
            return;
        }

        $event->addScript(
            'js/scripts/front-end/payments/paypal/buttons.js',
            ['class' => 'freeform-paypal-script']
        );
    }

    public function collectScripts(CollectScriptsEvent $event): void
    {
        $event->addScript(
            'paypal',
            'js/scripts/front-end/payments/paypal/buttons.js',
            ['class' => 'freeform-paypal-script']
        );
    }
}
