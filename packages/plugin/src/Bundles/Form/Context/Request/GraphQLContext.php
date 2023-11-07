<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Events\Fields\TransformValueEvent;
use Solspace\Freeform\Events\Forms\GraphQLRequestEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\PersistentValueInterface;
use Solspace\Freeform\Form\Form;
use yii\base\Event;

class GraphQLContext
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_GRAPHQL_REQUEST, [$this, 'handleRequest']);
    }

    public function handleRequest(GraphQLRequestEvent $event): void
    {
        $form = $event->getForm();
        $request = $event->getRequest();
        $arguments = $event->getArguments();

        if (!$form->isFormPosted() || !$form->isPagePosted()) {
            return;
        }

        if ($request->isConsoleRequest) {
            return;
        }

        foreach ($form->getLayout()->getFields() as $field) {
            if ($field instanceof PersistentValueInterface || !$field->getContentGqlHandle()) {
                continue;
            }

            if (!$field->includeInGqlSchema()) {
                continue;
            }

            if (isset($arguments[$field->getContentGqlHandle()])) {
                $postedValue = $arguments[$field->getContentGqlHandle()];

                $event = new TransformValueEvent($field, $postedValue);
                Event::trigger(FieldInterface::class, FieldInterface::EVENT_TRANSFORM_FROM_POST, $event);

                if (!$event->isValid) {
                    return;
                }

                $field->setValue($event->getValue());
            } else {
                $field->setValue(null);
            }
        }
    }
}
