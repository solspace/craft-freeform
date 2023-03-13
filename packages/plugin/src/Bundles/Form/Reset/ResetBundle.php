<?php

namespace Solspace\Freeform\Bundles\Form\Reset;

use Solspace\Freeform\Events\Forms\ResetEvent;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Interfaces\PersistentValueInterface;
use Solspace\Freeform\Fields\Interfaces\StaticValueInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class ResetBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_BEFORE_RESET, [$this, 'resetFieldValues']);
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
