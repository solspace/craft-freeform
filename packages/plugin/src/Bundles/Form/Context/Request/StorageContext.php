<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Bundles\Form\SaveForm\LoadSavedForm;
use Solspace\Freeform\Events\Fields\TransformValueEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Events\Forms\ResetEvent;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PersistentValueInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class StorageContext
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_REGISTER_CONTEXT, [$this, 'loadStoredValues']);
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'loadStoredValues']);
        Event::on(LoadSavedForm::class, Form::EVENT_FORM_LOADED, [$this, 'loadStoredValues']);
        Event::on(Form::class, Form::EVENT_AFTER_HANDLE_REQUEST, [$this, 'storeCurrentValues'], null, false);
        Event::on(Form::class, Form::EVENT_BEFORE_RESET, [$this, 'handleReset']);
    }

    public function loadStoredValues(FormEventInterface $event)
    {
        $form = $event->getForm();

        $bag = $form->getPropertyBag();
        $storedValues = $bag->get(Form::PROPERTY_STORED_VALUES, []);
        if (empty($storedValues)) {
            return;
        }

        foreach ($form->getLayout()->getFields() as $field) {
            if ($field instanceof PersistentValueInterface) {
                continue;
            }

            if (!\array_key_exists($field->getHandle(), $storedValues)) {
                continue;
            }

            $value = $storedValues[$field->getHandle()];

            $event = new TransformValueEvent($field, $value);
            Event::trigger(FieldInterface::class, FieldInterface::EVENT_TRANSFORM_FROM_STORAGE, $event);

            $field->setValue($event->getValue());
        }
    }

    public function storeCurrentValues(HandleRequestEvent $event)
    {
        $form = $event->getForm();
        if (!$form->isFormPosted() || !$form->isPagePosted()) {
            return;
        }

        $bag = $form->getPropertyBag();
        $storedValues = $bag->get(Form::PROPERTY_STORED_VALUES, []);

        if ($form->isGraphQLPosted()) {
            $fields = $form->getLayout()->getFields();
        } else {
            $fields = $form->getCurrentPage()->getFields();
        }

        foreach ($fields as $field) {
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
