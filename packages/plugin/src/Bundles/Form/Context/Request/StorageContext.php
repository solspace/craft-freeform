<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Events\Forms\ResetEvent;
use Solspace\Freeform\Fields\CheckboxField;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class StorageContext
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'loadStoredValues']);
        Event::on(Form::class, Form::EVENT_AFTER_HANDLE_REQUEST, [$this, 'storeCurrentValues'], null, false);
        Event::on(Form::class, Form::EVENT_BEFORE_RESET, [$this, 'handleReset']);
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
                continue;
            }

            $value = $storedValues[$field->getHandle()];
            if ($field instanceof CheckboxField) {
                $field->setIsCheckedByPost((bool) $value);

                continue;
            }

            $field->setValue($value);
        }
    }

    public function storeCurrentValues(HandleRequestEvent $event)
    {
        $form = $event->getForm();
        if (!$form->isFormPosted()) {
            return;
        }

        $bag = $form->getPropertyBag();
        $storedValues = $bag->get(Form::PROPERTY_STORED_VALUES, []);

        foreach ($form->getCurrentPage()->getFields() as $field) {
            if (!$field->getHandle()) {
                continue;
            }

            $storedValues[$field->getHandle()] = $field->getValue();
        }

        $bag->set(Form::PROPERTY_STORED_VALUES, $storedValues);
    }

    public function handleReset(ResetEvent $event)
    {
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();
        $form->getPropertyBag()->set(Form::PROPERTY_STORED_VALUES, []);
    }
}
