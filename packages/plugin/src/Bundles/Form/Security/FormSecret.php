<?php

namespace Solspace\Freeform\Bundles\Form\Security;

use Solspace\Commons\Helpers\CryptoHelper;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class FormSecret extends FeatureBundle
{
    public const KEY = 'secret';

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_FORM_LOADED, [$this, 'addSecret']);
    }

    public static function get(Form $form)
    {
        return $form->getPropertyBag()->get(self::KEY);
    }

    public function addSecret(FormEventInterface $event)
    {
        $secret = CryptoHelper::getUniqueToken(20);
        $event->getForm()->getPropertyBag()->set(self::KEY, $secret);
    }
}
