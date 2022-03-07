<?php

namespace Solspace\Freeform\Bundles\Form\HiddenInputs;

use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class FreeformActionInput extends FeatureBundle
{
    public const NAME = 'freeform-action';

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_RENDER_AFTER_OPEN_TAG, [$this, 'attachInput']);
    }

    public function attachInput(RenderTagEvent $event)
    {
        $event->addChunk('<input type="hidden" name="'.self::NAME.'" value="submit" />');
    }
}
