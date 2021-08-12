<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class OverrideContext
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_RENDER_BEFORE_OPEN_TAG, [$this, 'handleOverride']);
    }

    public function handleOverride(RenderTagEvent $event)
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
