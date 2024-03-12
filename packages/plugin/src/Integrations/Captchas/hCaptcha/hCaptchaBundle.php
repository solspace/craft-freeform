<?php

namespace Solspace\Freeform\Integrations\Captchas\hCaptcha;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Captchas\CaptchasBundle;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class hCaptchaBundle extends FeatureBundle
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

        $attributes = CaptchasBundle::getCaptchaAttributes($form);
        $attributes->replace('data-freeform-hcaptcha-container', true);

        $event->addChunk(
            '<div'.$attributes.'></div>',
            position: RenderTagEvent::POSITION_BEGINNING
        );
    }

    public function attachScripts(RenderTagEvent $event): void
    {
        $form = $event->getForm();

        $integration = $this->getHCaptchaForForm($form);
        if (!$integration) {
            return;
        }

        $version = $integration->getVersion();

        $scriptPath = \Craft::getAlias(
            '@freeform/Resources/js/scripts/front-end/captchas/hcaptcha/'.$version.'.js'
        );

        $locale = $integration->getLocale();
        if (empty($locale)) {
            $locale = \Craft::$app->locale->getLanguageID();
        }

        $script = file_get_contents($scriptPath);
        $event->addChunk(
            "<script type='text/javascript'>{$script}</script>",
            [
                'siteKey' => $integration->getSiteKey(),
                'formAnchor' => $form->getAnchor(),
                'theme' => $integration->getTheme(),
                'size' => $integration->getSize(),
                'lazyLoad' => $integration->isTriggerOnInteract() ? '1' : '',
                'version' => $integration->getVersion(),
                'locale' => $locale,
            ]
        );
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

        $integration = $this->getHCaptchaForForm($form);
        $integration?->validate($form);
    }

    public function attachToJson(OutputAsJsonEvent $event): void
    {
        $integration = $this->getHCaptchaForForm($event->getForm());
        if (!$integration) {
            return;
        }

        $event->add(
            'captcha',
            [
                'enabled' => true,
                'handle' => 'captcha',
                'name' => 'h-captcha-response',
            ]
        );
    }

    private function getHCaptchaForForm(Form $form): ?hCaptcha
    {
        if ($form->isDisabled()->captchas) {
            return null;
        }

        $integrations = $this->formIntegrationsProvider->getForForm($form, Type::TYPE_CAPTCHAS);
        foreach ($integrations as $integration) {
            if (!$integration->isEnabled()) {
                continue;
            }

            if ($integration instanceof hCaptcha) {
                return $integration;
            }
        }

        return null;
    }
}
