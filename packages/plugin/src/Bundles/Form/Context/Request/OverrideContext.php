<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class OverrideContext
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_REGISTER_CONTEXT, [$this, 'handleOverride']);
    }

    public function handleOverride(FormEventInterface $event)
    {
        $form = $event->getForm();
        $overrideValues = $form->getPropertyBag()->get('overrideValues');

        if (!\is_array($overrideValues)) {
            return;
        }

        foreach ($overrideValues as $field => $value) {
            $field = $form->get($field);
            if (!$field) {
                continue;
            }

            $field->setValue($value);
        }
    }
}
