<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Fields\Interfaces\PersistentValueInterface;
use Solspace\Freeform\Form\Form;
use yii\base\Event;

class OverrideContext
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_REGISTER_CONTEXT, [$this, 'handleOverride']);
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'handlePersistentFields']);
    }

    public function handleOverride(FormEventInterface $event): void
    {
        $form = $event->getForm();
        $overrideValues = $form->getProperties()->get('values');
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

    public function handlePersistentFields(FormEventInterface $event): void
    {
        $form = $event->getForm();

        if ($form->isGraphQLPosted()) {
            return;
        }

        $overrideValues = $form->getProperties()->get('values');
        if (!\is_array($overrideValues)) {
            return;
        }

        foreach ($overrideValues as $field => $value) {
            $field = $form->get($field);
            if (!$field instanceof PersistentValueInterface) {
                continue;
            }

            $field->setValue($value);
        }
    }
}
