<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\LocationField;

use Solspace\Freeform\Events\Forms\CollectScriptsEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Fields\Implementations\Pro\LocationField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class LocationFieldBundle extends FeatureBundle
{
    private const SCRIPT_PATH = 'js/scripts/front-end/fields/location.js';
    private const STYLE_PATH = 'css/front-end/fields/location.css';

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_COLLECT_SCRIPTS, [$this, 'collectScripts']);
        Event::on(Form::class, Form::EVENT_RENDER_BEFORE_CLOSING_TAG, [$this, 'attachScripts']);
    }

    public function collectScripts(CollectScriptsEvent $event): void
    {
        $event->addScript('field.location', self::SCRIPT_PATH);
        $event->addStylesheet('field.location', self::STYLE_PATH);
    }

    public function attachScripts(RenderTagEvent $event): void
    {
        if ($event->isGenerateTag() && $event->getForm()->getLayout()->getFields(LocationField::class)->count()) {
            $event->addScript(self::SCRIPT_PATH);
            $event->addStylesheet(self::STYLE_PATH);
        }
    }
}
