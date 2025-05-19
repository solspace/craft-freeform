<?php

namespace Solspace\Freeform\Bundles\Form\HiddenInputs;

use craft\helpers\Html;
use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Models\Settings;
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
        Event::on(Form::class, Form::EVENT_ATTACH_TAG_ATTRIBUTES, [$this, 'attachCsrfAttribute']);
        Event::on(Form::class, Form::EVENT_OUTPUT_AS_JSON, [$this, 'attachToJson']);
    }

    public function attachInput(RenderTagEvent $event): void
    {
        $isCSRFEnabled = $this->isCSRFEnabled();
        $isAsyncCSRFEnabled = $this->isAsyncCSRFEnabled();
        $isFormAJAX = $event->getForm()->getSettings()->getBehavior()->ajax;

        if (!$isCSRFEnabled) {
            return;
        }

        if ($isAsyncCSRFEnabled && $isFormAJAX) {
            return;
        }

        $this->setNoCacheHeaders();

        $event->addChunk(Html::csrfInput());
    }

    public function attachCsrfAttribute(AttachFormAttributesEvent $event): void
    {
        $isCSRFEnabled = $this->isCSRFEnabled();
        $isAsyncEnabled = $this->isAsyncCSRFEnabled();

        if (!$isCSRFEnabled || !$isAsyncEnabled) {
            return;
        }

        $refresh = $this->plugin()->settings->getSettingsModel()->csrfRefresh ?? Settings::CSRF_REFRESH_ONCE;

        $event
            ->getForm()
            ->getAttributes()
            ->set('data-csrf-refresh', $refresh)
        ;
    }

    public function attachToJson(OutputAsJsonEvent $event): void
    {
        $isCSRFEnabled = $this->isCSRFEnabled();
        if (!$isCSRFEnabled) {
            return;
        }

        if (!$this->isAsyncCSRFEnabled()) {
            $this->setNoCacheHeaders();
        }

        $csrfTokenName = \Craft::$app->getConfig()->getGeneral()->csrfTokenName;
        $csrfTokenValue = \Craft::$app->getRequest()->getCsrfToken();

        $event->add('csrfToken', [
            'name' => $csrfTokenName,
            'value' => $csrfTokenValue,
        ]);

        /*
         * @deprecated - this attribute is no longer used
         *
         * @remove - Freeform 6.0
         */
        $event->add('csrf', [
            'name' => $csrfTokenName,
            'value' => $csrfTokenValue,
            'token' => $csrfTokenValue,
        ]);
    }

    private function isCSRFEnabled(): bool
    {
        return \Craft::$app->getConfig()->getGeneral()->enableCsrfProtection;
    }

    private function isAsyncCSRFEnabled(): bool
    {
        return \Craft::$app->getConfig()->getGeneral()->asyncCsrfInputs;
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
