<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Events\Fields\TransformValueEvent;
use Solspace\Freeform\Events\Forms\HeadlessRequestEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\PersistentValueInterface;
use Solspace\Freeform\Form\Form;
use yii\base\Event;

class HeadlessRequestContext
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_HEADLESS_REQUEST, [$this, 'handleRequest']);
    }

    public function handleRequest(HeadlessRequestEvent $event): void
    {
        $form = $event->getForm();
        $values = $event->getValues();
        $transformed = [];

        foreach ($form->getLayout()->getFields() as $field) {
            if ($field instanceof PersistentValueInterface || !$field->getHandle()) {
                continue;
            }

            $handle = $field->getHandle();
            if (!\array_key_exists($handle, $values)) {
                continue;
            }

            $transformEvent = new TransformValueEvent($field, $values[$handle]);
            Event::trigger(FieldInterface::class, FieldInterface::EVENT_TRANSFORM_FROM_POST, $transformEvent);

            if (!$transformEvent->isValid) {
                continue;
            }

            $transformed[$handle] = $transformEvent->getValue();
        }

        if ([] !== $transformed) {
            $form->setFieldValues($transformed);
        }
    }
}
