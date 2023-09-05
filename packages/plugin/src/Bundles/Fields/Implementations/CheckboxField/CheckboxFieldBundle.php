<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\CheckboxField;

use Solspace\Freeform\Events\Fields\TransformValueEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class CheckboxFieldBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_REGISTER_CONTEXT, [$this, 'handleCheckedByDefault']);
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'handleCheckedByDefault']);
        Event::on(FieldInterface::class, FieldInterface::EVENT_TRANSFORM_FROM_POST, [$this, 'handleTransform']);
        Event::on(FieldInterface::class, FieldInterface::EVENT_TRANSFORM_FROM_STORAGE, [$this, 'handleTransform']);
    }

    public function handleCheckedByDefault(FormEventInterface $event): void
    {
        $form = $event->getForm();
        if ($form->isGraphQLPosted()) {
            return;
        }

        /** @var CheckboxField[] $fields */
        $fields = $form->getLayout()->getFields(CheckboxField::class);
        foreach ($fields as $field) {
            if (null === $field->isChecked()) {
                $field->setChecked($field->isCheckedByDefault());
            }
        }
    }

    public function handleTransform(TransformValueEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof CheckboxField) {
            return;
        }

        if ($event->getValue()) {
            $field->setChecked(true);
            $event->setValue($field->getDefaultValue());
        } else {
            $field->setChecked(false);
            $event->setValue(null);
        }
    }
}
