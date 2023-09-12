<?php

namespace Solspace\Freeform\Integrations\Captchas;

use Composer\ClassMapGenerator\ClassMapGenerator;
use Solspace\Freeform\Events\Integrations\RegisterIntegrationTypesEvent;
use Solspace\Freeform\Integrations\Captchas\hCaptcha\hCaptcha;
use Solspace\Freeform\Integrations\Captchas\ReCaptcha\ReCaptcha;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class CaptchasBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            IntegrationsService::class,
            IntegrationsService::EVENT_REGISTER_INTEGRATION_TYPES,
            [$this, 'registerTypes']
        );
    }

    public function registerTypes(RegisterIntegrationTypesEvent $event): void
    {
        $event->addType(ReCaptcha::class);

        if ($this->plugin()->isPro()) {
            $event->addType(hCaptcha::class);
        }
    }
}
