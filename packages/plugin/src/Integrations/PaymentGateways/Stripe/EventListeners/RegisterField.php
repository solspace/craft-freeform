<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\EventListeners;

use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Fields\Types\RegisterFieldTypesEvent;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class RegisterField extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            FieldTypesProvider::class,
            FieldTypesProvider::EVENT_REGISTER_FIELD_TYPES,
            [$this, 'registerFieldTypes']
        );
    }

    public function registerFieldTypes(RegisterFieldTypesEvent $event): void
    {
        $event->addType(StripeField::class);
    }
}
