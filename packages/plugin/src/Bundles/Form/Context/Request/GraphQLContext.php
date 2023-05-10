<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Events\Fields\TransformValueEvent;
use Solspace\Freeform\Events\Forms\GraphQLRequestEvent;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PersistentValueInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
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

        if ($request->isConsoleRequest) {
            return;
        }

        if (!$request->getHeaders()->get('x-craft-gql-schema')) {
            return;
        }

        foreach ($form->getLayout()->getFields() as $field) {
            if ($field instanceof PersistentValueInterface || !$field->getHandle()) {
                continue;
            }

            if (!$field->includeInGqlSchema() || !isset($arguments[$field->getHandle()])) {
                continue;
            }

            $postedValue = $arguments[$field->getHandle()];

            $event = new TransformValueEvent($field, $postedValue);
            Event::trigger(FieldInterface::class, FieldInterface::EVENT_TRANSFORM_FROM_POST, $event);

            if (!$event->isValid) {
                return;
            }

            $field->setValue($event->getValue());
        }
    }
}
