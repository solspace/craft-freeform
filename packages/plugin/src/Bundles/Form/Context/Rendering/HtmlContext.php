<?php

namespace Solspace\Freeform\Bundles\Form\Context\Rendering;

use Solspace\Freeform\Bundles\Form\Context\Session\SessionContext;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class HtmlContext
{
    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_RENDER_AFTER_OPEN_TAG,
            [$this, 'addHiddenInputs']
        );
    }

    public function addHiddenInputs(RenderTagEvent $event)
    {
        $form = $event->getForm();

        $formHash = SessionContext::getFormHash($form);
        $pageHash = SessionContext::getPageHash($form);
        $sessionToken = SessionContext::getFormSessionToken($form);

        $event->addChunk(
            sprintf(
                '<input type="hidden" name="%s" value="%s" />',
                SessionContext::KEY_FORM,
                $formHash
            )
        );

        $event->addChunk(
            sprintf(
                '<input type="hidden" name="%s" value="%s" />',
                SessionContext::KEY_PAGE,
                $pageHash
            )
        );

        $event->addChunk(
            sprintf(
                '<input type="hidden" name="%s" value="%s" />',
                SessionContext::KEY_SESSION_TOKEN,
                $sessionToken
            )
        );
    }
}
