<?php

namespace Solspace\Freeform\Bundles\Form\HiddenInputs;

use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class StatusInput extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_RENDER_AFTER_OPEN_TAG, [$this, 'attachInput']);
        Event::on(Form::class, Form::EVENT_OUTPUT_AS_JSON, [$this, 'attachToJson']);
    }

    public function attachInput(RenderTagEvent $event)
    {
        $bag = $event->getForm()->getPropertyBag();
        if ($bag->get('status')) {
            $encryptedStatus = $this->getEncryptedStatus($bag);
            $event->addChunk('<input type="hidden" '.'name="'.Form::STATUS_KEY.'" '.'value="'.$encryptedStatus.'" '.'/>');
        }
    }

    public function attachToJson(OutputAsJsonEvent $event)
    {
        $bag = $event->getForm()->getPropertyBag();
        if ($bag->get('status')) {
            $event->add('status', $this->getEncryptedStatus($bag->get('status')));
        }
    }

    private function getEncryptedStatus($status): string
    {
        return base64_encode(\Craft::$app->security->encryptByKey($status));
    }
}
