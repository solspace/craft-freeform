<?php

namespace Solspace\Freeform\Integrations\Captchas\ReCaptcha;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use yii\base\Event;

class ReCaptchaBundle extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $formIntegrationsProvider,
    ) {
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

    public function attachScripts(RenderTagEvent $event): void
    {
        $form = $event->getForm();

        $integration = $this->getReCaptchaForForm($form);
        if (!$integration) {
            return;
        }

        $version = $integration->getVersion();

        $scriptPath = \Craft::getAlias(
            '@freeform/Resources/js/scripts/front-end/captchas/recaptcha/'.$version.'.js'
        );

        $script = file_get_contents($scriptPath);
        $script = str_replace(
            [
                '{siteKey}',
                '{formAnchor}',
                '{theme}',
                '{size}',
                '{lazyLoad}',
                '{version}',
                '{action}',
            ],
            [
                $integration->getSiteKey(),
                $form->getAnchor(),
                $integration->getTheme(),
                $integration->getSize(),
                $integration->isTriggerOnInteract() ? '1' : '',
                $integration->getVersion(),
                $integration->getAction(),
            ],
            $script
        );

        $event->addChunk("<script type='text/javascript'>{$script}</script>");
    }

    public function triggerValidation(ValidationEvent $event): void
    {
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();
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
        $integrations = $this->formIntegrationsProvider->getForForm($form, IntegrationInterface::TYPE_CAPTCHAS);
        foreach ($integrations as $integration) {
            if (!$integration->isEnabled()) {
                continue;
            }

            if ($integration instanceof ReCaptcha) {
                return $integration;
            }
        }

        return null;
    }
}
