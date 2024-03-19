<?php

namespace Solspace\Freeform\Bundles\Form\HiddenInputs;

use Craft;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class CsrfInput extends FeatureBundle
{
    public function __construct()
    {
        $isCsrfEnabled = \Craft::$app->getConfig()->getGeneral()->enableCsrfProtection;
        if (!$isCsrfEnabled) {
            return;
        }

        // Prevent response from being cached with token
        Craft::$app->getResponse()->setNoCacheHeaders();

        Event::on(Form::class, Form::EVENT_RENDER_AFTER_OPEN_TAG, [$this, 'attachInput']);
        Event::on(Form::class, Form::EVENT_OUTPUT_AS_JSON, [$this, 'attachToJson']);
    }

    public function attachInput(RenderTagEvent $event)
    {
        $name = \Craft::$app->getConfig()->getGeneral()->csrfTokenName;
        $token = \Craft::$app->request->csrfToken;

        $event->addChunk('<input type="hidden" name="'.$name.'" value="'.$token.'" />');
    }

    public function attachToJson(OutputAsJsonEvent $event)
    {
        $name = \Craft::$app->getConfig()->getGeneral()->csrfTokenName;
        $token = \Craft::$app->request->csrfToken;

        $event->add('csrf', [
            'name' => $name,
            'token' => $token,
        ]);
    }
}
