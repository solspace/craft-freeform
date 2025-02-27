<?php

namespace Solspace\Freeform\Bundles\Form\HiddenInputs;

use Solspace\Freeform\Bundles\Form\Context\Session\SessionContext;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class UniqueIdInput extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_RENDER_AFTER_OPEN_TAG, [$this, 'attachInput']);
        Event::on(Form::class, Form::EVENT_OUTPUT_AS_JSON, [$this, 'attachToJson']);
    }

    public function attachInput(RenderTagEvent $event): void
    {
        $value = $this->getUniqueId($event->getForm());
        if (null === $value) {
            return;
        }

        $event->addChunk('<input type="hidden" name="'.SessionContext::KEY_UNIQUE_ID.'" value="'.$value.'" />');
    }

    public function attachToJson(OutputAsJsonEvent $event): void
    {
        $value = $this->getUniqueId($event->getForm());
        if (null === $value) {
            return;
        }

        $event->add(SessionContext::KEY_UNIQUE_ID, $value);
    }

    private function getUniqueId(Form $form): ?string
    {
        $uniqueId = $form->getUniqueId();
        if (!$uniqueId) {
            return null;
        }

        return htmlentities($uniqueId, \ENT_QUOTES | \ENT_SUBSTITUTE | \ENT_HTML401);
    }
}
