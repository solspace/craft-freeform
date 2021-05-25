<?php

namespace Solspace\Freeform\Bundles\Form\HiddenInputs;

use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class SubmissionTokenInput implements BundleInterface
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_RENDER_AFTER_OPEN_TAG, [$this, 'attachInput']);
    }

    public function attachInput(RenderTagEvent $event)
    {
        $bag = $event->getForm()->getPropertyBag();

        if ($bag->get('submissionToken')) {
            $name = Form::SUBMISSION_TOKEN_KEY;
            $value = $bag->get('submissionToken');

            $event->addChunk('<input type="hidden" '.'name="'.$name.'" '.'value="'.$value.'" '.'/>');
        }
    }
}
