<?php

namespace Solspace\Freeform\Integrations\Captchas\Turnstile;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\CollectScriptsEvent;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Captchas\CaptchasBundle;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\SettingsService;
use yii\base\Event;

class TurnstileBundle extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $formIntegrationsProvider,
    ) {
        Event::on(
            Form::class,
            Form::EVENT_RENDER_BEFORE_CLOSING_TAG,
            [$this, 'attachHtmlElement'],
        );

        Event::on(
            Form::class,
            Form::EVENT_RENDER_BEFORE_CLOSING_TAG,
            [$this, 'attachScripts'],
        );

        Event::on(
            Form::class,
            Form::EVENT_COLLECT_SCRIPTS,
            [$this, 'collectScripts'],
        );

        Event::on(
            Form::class,
            Form::EVENT_BEFORE_VALIDATE,
            [$this, 'triggerValidation']
        );

        Event::on(
            Form::class,
            Form::EVENT_OUTPUT_AS_JSON,
            [$this, 'attachToJson'],
        );
    }

    public function attachHtmlElement(RenderTagEvent $event): void
    {
        $form = $event->getForm();
        if (!$form->isLastPage()) {
            return;
        }

        $integration = $this->getCaptcha($form);
        if (!$integration) {
            return;
        }

        $locale = $integration->getLocale();
        if (empty($locale)) {
            $locale = \Craft::$app->locale->getLanguageID();
        }

        $attributes = CaptchasBundle::getCaptchaAttributes($form);
        $attributes
            ->replace('data-freeform-turnstile-container')
            ->replace('data-captcha', 'turnstile')
            ->setIfEmpty('data-site-key', $integration->getSiteKey())
            ->setIfEmpty('data-theme', $integration->getTheme())
            ->setIfEmpty('data-size', $integration->getSize())
            ->setIfEmpty('data-lazy-load', $integration->isTriggerOnInteract())
            ->setIfEmpty('data-action', $integration->getAction())
            ->setIfEmpty('data-language', $locale)
        ;

        $event->addChunk(
            '<div'.$attributes.'></div>',
            position: RenderTagEvent::POSITION_BEGINNING
        );
    }

    public function attachScripts(RenderTagEvent $event): void
    {
        if (!$event->isGenerateTag()) {
            return;
        }

        $form = $event->getForm();

        $integration = $this->getCaptcha($form);
        if (!$integration) {
            return;
        }

        $event->addScript('js/scripts/front-end/captchas/turnstile/v0.js');
    }

    public function collectScripts(CollectScriptsEvent $event): void
    {
        $event->addScript('turnstile', 'js/scripts/front-end/captchas/turnstile/v0.js');
    }

    public function triggerValidation(ValidationEvent $event): void
    {
        if (!$event->isValid) {
            return;
        }

        $settingsModel = $this->getSettingsService()->getSettingsModel();
        if ($settingsModel->bypassSpamCheckOnLoggedInUsers && \Craft::$app->getUser()->id) {
            return;
        }

        $form = $event->getForm();
        if (!$form->isLastPage()) {
            return;
        }

        if (!$form->isCaptchaEnabled()) {
            return;
        }

        $integration = $this->getCaptcha($form);
        $integration?->validate($form);
    }

    public function attachToJson(OutputAsJsonEvent $event): void
    {
        $integration = $this->getCaptcha($event->getForm());
        if (!$integration) {
            return;
        }

        $event->add(
            'captcha',
            [
                'enabled' => true,
                'handle' => 'captcha',
                'name' => 'cf-turnstile-response',
            ]
        );
    }

    private function getCaptcha(Form $form): ?Turnstile
    {
        if ($form->isDisabled()->captchas) {
            return null;
        }

        return $this->formIntegrationsProvider->getFirstForForm($form, Turnstile::class);
    }

    private function getSettingsService(): SettingsService
    {
        return $this->plugin()->settings;
    }
}
