<?php

namespace Solspace\Freeform\Bundles\Form\HiddenInputs;

use craft\helpers\Html;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class CsrfInput extends FeatureBundle
{
    public function __construct()
    {
        $isCsrfEnabled = \Craft::$app->getConfig()->getGeneral()->enableCsrfProtection;
        if (!$isCsrfEnabled) {
            return;
        }

        Event::on(Form::class, Form::EVENT_RENDER_AFTER_OPEN_TAG, [$this, 'attachInput']);
        Event::on(Form::class, Form::EVENT_OUTPUT_AS_JSON, [$this, 'attachToJson']);
    }

    public function attachInput(RenderTagEvent $event)
    {
        $this->setNoCacheHeaders();
        $event->addChunk(Html::csrfInput());
    }

    public function attachToJson(OutputAsJsonEvent $event)
    {
        $this->setNoCacheHeaders();
        $name = \Craft::$app->getConfig()->getGeneral()->csrfTokenName;
        $token = \Craft::$app->request->csrfToken;

        $event->add('csrf', [
            'name' => $name,
            'token' => $token,
        ]);
    }

    /**
     * Craft 5.2.6/4.10.5+ does this for us, but doesn't hurt to do it manually here for prior versions.
     */
    private function setNoCacheHeaders(): void
    {
        if (\Craft::$app->request->isConsoleRequest) {
            return;
        }

        // Prevent response from being cached with token
        \Craft::$app->getResponse()->setNoCacheHeaders();
    }
}
