<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Fields\Interfaces\DefaultValueInterface;
use Solspace\Freeform\Form\Form;
use yii\base\Event;

class DefaultValuesContext
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_REGISTER_CONTEXT, [$this, 'handleDefaultValues']);
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'handleDefaultValues']);
    }

    public function handleDefaultValues(FormEventInterface $event): void
    {
        $form = $event->getForm();
        if ($form->isGraphQLPosted()) {
            return;
        }

        $fields = $form->getLayout()->getFields(DefaultValueInterface::class);
        foreach ($fields as $field) {
            $field->setValue($field->getDefaultValue());
        }
    }
}
