<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie\EventListeners;

use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Fields\Types\RegisterFieldTypesEvent;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\CollectScriptsEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Fields\MollieField;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Mollie;
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
            [$this, 'attachMollieScripts']
        );

        Event::on(
            Form::class,
            Form::EVENT_COLLECT_SCRIPTS,
            [$this, 'collectScripts']
        );
    }

    public function registerFieldTypes(RegisterFieldTypesEvent $event): void
    {
        $hasMollie = Freeform::getInstance()
            ->integrations
            ->isIntegrationInstalled(Mollie::class)
        ;

        if ($hasMollie) {
            $event->addType(MollieField::class);
        }
    }

    public function attachMollieScripts(RenderTagEvent $event): void
    {
        if (!$event->isGenerateTag()) {
            return;
        }

        $form = $event->getForm();
        if (!$form->getFields()->hasFieldOfClass(MollieField::class)) {
            return;
        }

        $integration = $this->integrationsProvider->getFirstForForm($form, Mollie::class);
        if (!$integration) {
            return;
        }

        $event->addScript(
            'js/scripts/front-end/payments/mollie/index.js',
            ['class' => 'freeform-mollie-script']
        );
    }

    public function collectScripts(CollectScriptsEvent $event): void
    {
        $event->addScript(
            'mollie',
            'js/scripts/front-end/payments/mollie/index.js',
            ['class' => 'freeform-mollie-script']
        );
    }
}
