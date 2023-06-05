<?php

namespace Solspace\Freeform\Bundles\Form\HiddenInputs;

use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class ReturnUrlInput extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_RENDER_AFTER_OPEN_TAG, [$this, 'attachInput']);
        Event::on(Form::class, Form::EVENT_OUTPUT_AS_JSON, [$this, 'attachToJson']);
    }

    public function attachInput(RenderTagEvent $event)
    {
        $form = $event->getForm();
        $bag = $form->getProperties();

        if ($bag->get('returnUrl')) {
            $name = Form::RETURN_URI_KEY;
            $value = $this->getHashedUrl($bag->get('returnUrl'));
            $value = htmlspecialchars($value);

            $event->addChunk('<input type="hidden" name="'.$name.'" value="'.$value.'" />');
        }
    }

    public function attachToJson(OutputAsJsonEvent $event)
    {
        $bag = $event->getForm()->getProperties();
        if ($bag->get('returnUrl')) {
            $event->add('returnUrl', $this->getHashedUrl($bag->get('returnUrl')));
        }
    }

    private function getHashedUrl($url): string
    {
        return \Craft::$app->security->hashData($url);
    }
}
