<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Events\Fields\TransformValueEvent;
use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PersistentValueInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class PostContext
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'handleRequest']);
    }

    public function handleRequest(HandleRequestEvent $event)
    {
        $form = $event->getForm();
        $request = $event->getRequest();

        if ($request->isConsoleRequest) {
            return;
        }

        if ($request->getHeaders()->get('Freeform-Preflight')) {
            return;
        }

        if ('POST' !== $request->getMethod() || !$form->isPagePosted()) {
            return;
        }

        foreach ($form->getCurrentPage()->getFields() as $field) {
            if ($field instanceof PersistentValueInterface || !$field->getHandle()) {
                continue;
            }

            $postedValue = $request->post($field->getHandle());

            $event = new TransformValueEvent($field, $postedValue);
            Event::trigger(FieldInterface::class, FieldInterface::EVENT_TRANSFORM_FROM_POST, $event);

            $field->setValue($event->getValue());
        }
    }
}
