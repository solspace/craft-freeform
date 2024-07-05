<?php

namespace Solspace\Freeform\Integrations\Captchas\ReCaptcha;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Captchas\CaptchasBundle;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class ReCaptchaBundle extends FeatureBundle
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

        $integration = $this->getReCaptchaForForm($form);
        if (!$integration) {
            return;
        }

        $locale = $integration->getLocale();
        if (empty($locale)) {
            $locale = \Craft::$app->locale->getLanguageID();
        }

        $attributes = CaptchasBundle::getCaptchaAttributes($form);
        $attributes
            ->replace('data-freeform-recaptcha-container')
            ->replace('data-captcha', 'recaptcha')
            ->setIfEmpty('data-site-key', $integration->getSiteKey())
            ->setIfEmpty('data-theme', $integration->getTheme())
            ->setIfEmpty('data-size', $integration->getSize())
            ->setIfEmpty('data-lazy-load', $integration->isTriggerOnInteract())
            ->setIfEmpty('data-version', $integration->getVersion())
            ->setIfEmpty('data-action', $integration->getAction())
            ->setIfEmpty('data-locale', $locale)
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

        $integration = $this->getReCaptchaForForm($form);
        if (!$integration) {
            return;
        }

        $version = $integration->getVersion();
        $event->addScript('js/scripts/front-end/captchas/recaptcha/'.$version.'.js');
    }

    public function triggerValidation(ValidationEvent $event): void
    {
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();
        if (!$form->isLastPage()) {
            return;
        }

        $integration = $this->getReCaptchaForForm($form);
        $integration?->validate($form);
    }

    public function attachToJson(OutputAsJsonEvent $event): void
    {
        $integration = $this->getReCaptchaForForm($event->getForm());
        if (!$integration) {
            return;
        }

        $event->add(
            'captcha',
            [
                'enabled' => true,
                'handle' => 'captcha',
                'name' => 'g-recaptcha-response',
            ]
        );
    }

    private function getReCaptchaForForm(Form $form): ?ReCaptcha
    {
        if ($form->isDisabled()->captchas) {
            return null;
        }

        return $this->formIntegrationsProvider->getFirstForForm($form, ReCaptcha::class);
    }
}
