<?php

namespace Solspace\Freeform\Bundles\Form\HiddenInputs;

use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class SourceUrlInput extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_RENDER_AFTER_OPEN_TAG, [$this, 'attachInput']);
        Event::on(Form::class, Form::EVENT_OUTPUT_AS_JSON, [$this, 'attachToJson']);
    }

    public function attachInput(RenderTagEvent $event): void
    {
        $sourceUrl = \Craft::$app->getRequest()->getAbsoluteUrl();
        $sourceUrl = htmlspecialchars($sourceUrl, \ENT_QUOTES | \ENT_SUBSTITUTE | \ENT_HTML401);

        $event->addChunk('<input type="hidden" name="'.Form::SOURCE_URL_KEY.'" value="'.$sourceUrl.'" />');
    }

    public function attachToJson(OutputAsJsonEvent $event): void
    {
        $event->add(Form::SOURCE_URL_KEY, \Craft::$app->getRequest()->getAbsoluteUrl());
    }
}
