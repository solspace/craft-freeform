<?php

namespace Solspace\Freeform\Bundles\Payments\Stripe;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class StripePaymentsBundle implements BundleInterface
{
    public function __construct()
    {
        $freeform = Freeform::getInstance();
        if (!$freeform->isPro()) {
            return;
        }

        Event::on(Form::class, Form::EVENT_AFTER_VALIDATE, [$freeform->stripe, 'preProcessPayment']);
        Event::on(Form::class, Form::EVENT_AFTER_VALIDATE, [$freeform->stripe, 'preProcessSubscription']);
    }
}
