<?php

namespace Solspace\Freeform\Bundles\Form\Reset;

use Solspace\Freeform\Events\Forms\ResetEvent;
use Solspace\Freeform\Fields\HiddenField;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PersistentValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\StaticValueInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class ResetBundle implements BundleInterface
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_BEFORE_RESET, [$this, 'checkSubmissionToken']);
        Event::on(Form::class, Form::EVENT_BEFORE_RESET, [$this, 'resetFieldValues']);
        Event::on(Form::class, Form::EVENT_BEFORE_RESET, [$this, 'resetInitTime']);
    }

    public function resetInitTime(ResetEvent $event)
    {
        $event->getForm()->getPropertyBag()->set(Form::INIT_TIME_KEY, time());
    }

    public function checkSubmissionToken(ResetEvent $event)
    {
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();
        if ($form->getAssociatedSubmissionToken()) {
            $event->isValid = false;
        }
    }

    public function resetFieldValues(ResetEvent $event)
    {
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();
        foreach ($form->getLayout()->getFields() as $field) {
            if (
                $field instanceof HiddenField
                || $field instanceof StaticValueInterface
                || $field instanceof PersistentValueInterface
                || $field instanceof NoStorageInterface
            ) {
                continue;
            }

            $field->setValue(null);
        }
    }
}
