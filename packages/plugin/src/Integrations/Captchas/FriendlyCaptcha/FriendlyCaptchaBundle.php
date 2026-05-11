<?php

namespace Solspace\Freeform\Integrations\Captchas\FriendlyCaptcha;

use Solspace\Freeform\Events\Forms\CollectScriptsEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use yii\base\Event;

class FriendlyCaptchaBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_COLLECT_SCRIPTS,
            [$this, 'collectScripts'],
        );

        Event::on(
            Form::class,
            Form::EVENT_AFTER_VALIDATE,
            [$this, 'attachRiskScoresToSpamReasons'],
        );
    }

    public function collectScripts(CollectScriptsEvent $event): void
    {
        $event->addScript('friendly-captcha', 'js/scripts/front-end/captchas/friendly-captcha/v2.js');
    }

    public function attachRiskScoresToSpamReasons(ValidationEvent $event): void
    {
        $form = $event->getForm();
        if (!$form->isMarkedAsSpam()) {
            return;
        }

        $bag = $form->getProperties();
        $value = $bag->get(FriendlyCaptcha::PROPERTY_RISK_CACHE);
        if (null === $value || '' === $value) {
            return;
        }

        $bag->remove(FriendlyCaptcha::PROPERTY_RISK_CACHE);

        $form->markAsSpam(SpamReason::TYPE_GENERIC, 'Friendly Captcha risk scores', $value);
    }
}
