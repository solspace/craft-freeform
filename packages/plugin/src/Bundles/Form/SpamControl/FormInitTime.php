<?php

namespace Solspace\Freeform\Bundles\Form\SpamControl;

use Solspace\Freeform\Events\Forms\FormLoadedEvent;
use Solspace\Freeform\Events\Forms\ResetEvent;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class FormInitTime implements BundleInterface
{
    const KEY = 'init-time';

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_FORM_LOADED, [$this, 'handleFormLoaded']);
        Event::on(Form::class, Form::EVENT_BEFORE_RESET, [$this, 'handleFormReset']);
    }

    public function handleFormLoaded(FormLoadedEvent $event)
    {
        $bag = $event->getForm()->getPropertyBag();
        if (!$bag->get(self::KEY)) {
            $bag->set(self::KEY, time());
        }
    }

    public function handleFormReset(ResetEvent $event)
    {
        $event->getForm()->getPropertyBag()->set(self::KEY, time());
    }
}
