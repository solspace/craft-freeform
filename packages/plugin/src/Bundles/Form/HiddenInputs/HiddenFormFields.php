<?php

namespace Solspace\Freeform\Bundles\Form\HiddenInputs;

use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class HiddenFormFields extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_RENDER_AFTER_OPEN_TAG, [$this, 'attachInput']);
    }

    public function attachInput(RenderTagEvent $event)
    {
        $hiddenFields = $event->getForm()->getFields()->getList(HiddenField::class);

        foreach ($hiddenFields as $field) {
            $event->addChunk($field->renderInput());
        }
    }
}
