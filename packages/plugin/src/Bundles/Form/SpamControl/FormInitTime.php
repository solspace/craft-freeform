<?php

namespace Solspace\Freeform\Bundles\Form\SpamControl;

use Solspace\Freeform\Bundles\Form\SaveForm\Events\SaveFormEvent;
use Solspace\Freeform\Bundles\Form\SaveForm\SaveForm;
use Solspace\Freeform\Events\Forms\FormLoadedEvent;
use Solspace\Freeform\Events\Forms\ResetEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class FormInitTime extends FeatureBundle
{
    public const KEY = 'init-time';

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_FORM_LOADED, [$this, 'handleFormLoaded']);
        Event::on(Form::class, Form::EVENT_BEFORE_RESET, [$this, 'handleFormReset']);
        Event::on(SaveForm::class, SaveForm::EVENT_SAVE_FORM, [$this, 'cleanupOnSave']);
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

    public function cleanupOnSave(SaveFormEvent $event)
    {
        $event->getForm()->getPropertyBag()->remove(self::KEY);
    }
}
