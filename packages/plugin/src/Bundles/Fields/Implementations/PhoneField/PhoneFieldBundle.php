<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\PhoneField;

use Solspace\Freeform\Events\Forms\CollectScriptsEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class PhoneFieldBundle extends FeatureBundle
{
    private const SCRIPT_PATH = 'js/scripts/front-end/fields/phone.js';

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_COLLECT_SCRIPTS, [$this, 'collectScripts']);
        Event::on(Form::class, Form::EVENT_RENDER_BEFORE_CLOSING_TAG, [$this, 'attachScripts']);
    }

    public function collectScripts(CollectScriptsEvent $event): void
    {
        $event->addScript('field.phone', self::SCRIPT_PATH);
    }

    public function attachScripts(RenderTagEvent $event): void
    {
        if (!$event->isGenerateTag()) {
            return;
        }
        foreach ($event->getForm()->getLayout()->getFields() as $field) {
            if ($field instanceof PhoneField && $field->isInternational()) {
                $event->addScript(self::SCRIPT_PATH);

                return;
            }
        }
    }
}
