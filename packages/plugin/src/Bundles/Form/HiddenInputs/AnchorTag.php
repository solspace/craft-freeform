<?php

namespace Solspace\Freeform\Bundles\Form\HiddenInputs;

use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class AnchorTag extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_RENDER_AFTER_OPEN_TAG, [$this, 'attachInput']);
        Event::on(Form::class, Form::EVENT_OUTPUT_AS_JSON, [$this, 'attachToJson']);
    }

    public function attachInput(RenderTagEvent $event)
    {
        $form = $event->getForm();

        if (Freeform::getInstance()->forms->isAutoscrollToErrorsEnabled()) {
            $event->addChunk('<div id="'.$form->getAnchor().'" data-scroll-anchor style="display: none;"></div>');
        }
    }

    public function attachToJson(OutputAsJsonEvent $event)
    {
        $event->add('anchor', $event->getForm()->getAnchor());
    }
}
