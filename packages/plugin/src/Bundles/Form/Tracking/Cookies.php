<?php

namespace Solspace\Freeform\Bundles\Form\Tracking;

use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class Cookies extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_AFTER_SUBMIT, [$this, 'setPostedCookie']);
    }

    public static function getCookieName(Form $form): string
    {
        return 'form_posted_'.$form->getId();
    }

    public function setPostedCookie(SubmitEvent $event)
    {
        if (\Craft::$app->request->isConsoleRequest) {
            return;
        }

        $form = $event->getForm();
        $name = self::getCookieName($form);
        $value = time();

        setcookie(
            $name,
            $value,
            (int) strtotime('+1 year'),
            '/',
            \Craft::$app->getConfig()->getGeneral()->defaultCookieDomain,
            true,
            true
        );

        $_COOKIE[$name] = $value;
    }
}
