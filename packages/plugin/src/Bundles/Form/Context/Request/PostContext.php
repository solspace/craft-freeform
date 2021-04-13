<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Events\Forms\HandleRequestEvent;
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

        if ('POST' !== $request->getMethod() || !$form->isPagePosted()) {
            return;
        }

        foreach ($form->getCurrentPage()->getFields() as $field) {
            $postedValue = $request->post($field->getHandle());

            $field->setValue($postedValue);
        }
    }
}
