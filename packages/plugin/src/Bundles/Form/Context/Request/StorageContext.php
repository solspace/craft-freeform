<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class StorageContext
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'loadStoredValues']);
        Event::on(Form::class, Form::EVENT_AFTER_HANDLE_REQUEST, [$this, 'storeCurrentValues'], null, false);
    }

    public function loadStoredValues(HandleRequestEvent $event)
    {
        $form = $event->getForm();
        if (!$form->isFormPosted()) {
            return;
        }

        $bag = $form->getPropertyBag();
        $storedValues = $bag->get(Form::PROPERTY_STORED_VALUES, []);

        foreach ($form->getLayout()->getFields() as $field) {
            if (!\array_key_exists($field->getHandle(), $storedValues)) {
                break;
            }

            $field->setValue($storedValues[$field->getHandle()]);
        }
    }

    public function storeCurrentValues(HandleRequestEvent $event)
    {
        $form = $event->getForm();
        if (!$form->isPagePosted()) {
            return;
        }

        $bag = $form->getPropertyBag();
        $storedValues = $bag->get(Form::PROPERTY_STORED_VALUES, []);

        foreach ($form->getCurrentPage()->getFields() as $field) {
            if (!$field->getHandle()) {
                break;
            }

            $storedValues[$field->getHandle()] = $field->getValue();
        }

        $bag->set(Form::PROPERTY_STORED_VALUES, $storedValues);
    }
}
