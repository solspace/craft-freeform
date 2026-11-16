<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\EventListeners;

use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Fields\Types\RegisterFieldTypesEvent;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Rules\RuleValidator;
use Solspace\Freeform\Events\Forms\CollectScriptsEvent;
use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\PaymentGateways\Common\PaymentStorageService;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class RegisterField extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
        private PaymentStorageService $storageService,
        private RuleValidator $ruleValidator,
    ) {
        Event::on(Form::class, Form::EVENT_AFTER_HANDLE_REQUEST, [$this, 'validatePaymentStorage']);

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

        Event::on(
            Form::class,
            Form::EVENT_COLLECT_SCRIPTS,
            [$this, 'collectScripts']
        );
    }

    public function validatePaymentStorage(HandleRequestEvent $event): void
    {
        // Stripe confirms the payment after quick-save succeeds. Recheck here in
        // case storage or the visitor's consent changed since the element loaded.
        if ($event->isLookupCall() || 'freeform/submit/quick-save' !== $event->getRequest()->getBodyParam('action')) {
            return;
        }

        $form = $event->getForm();
        foreach ($form->getLayout()->getFields(StripeField::class) as $field) {
            if ($this->ruleValidator->isFieldHidden($form, $field) || (!$field->getValue() && !$field->isRequired())) {
                continue;
            }

            $configured = $field->getIntegration();
            $integration = $configured ? $this->integrationsProvider->getFirstForForm(
                $form,
                Stripe::class,
                filter: static fn ($integration) => $integration->getId() === $configured->getId(),
            ) : null;
            if (!$integration) {
                continue;
            }

            try {
                $this->storageService->assertCanStore($form, $integration, 'Stripe');
            } catch (\InvalidArgumentException $exception) {
                $message = Freeform::t($exception->getMessage());
                $field->addError($message);
                $form->addError($message);
                $event->isValid = false;
            }
        }
    }

    public function registerFieldTypes(RegisterFieldTypesEvent $event): void
    {
        $hasStripe = Freeform::getInstance()
            ->integrations
            ->isIntegrationInstalled(Stripe::class)
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

        $form = $event->getForm();
        if (!$form->getFields()->hasFieldOfClass(StripeField::class)) {
            return;
        }

        $integration = $this->integrationsProvider->getFirstForForm($form, Stripe::class);
        if (!$integration) {
            return;
        }

        $event->addScript(
            'js/scripts/front-end/payments/stripe/elements.js',
            ['class' => 'freeform-stripe-script']
        );
    }

    public function collectScripts(CollectScriptsEvent $event): void
    {
        $event->addScript(
            'stripe',
            'js/scripts/front-end/payments/stripe/elements.js',
            ['class' => 'freeform-stripe-script']
        );
    }
}
