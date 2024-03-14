<?php

namespace Solspace\Freeform\Integrations\Captchas;

use Solspace\Freeform\Events\Forms\SetPropertiesEvent;
use Solspace\Freeform\Events\Integrations\RegisterIntegrationTypesEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Captchas\hCaptcha\hCaptcha;
use Solspace\Freeform\Integrations\Captchas\ReCaptcha\ReCaptcha;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class CaptchasBundle extends FeatureBundle
{
    public const KEY_CAPTCHA_PROPERTIES = 'captchas';
    public const KEY_CAPTCHA_PROPERTY_STACK = 'captchaPropertyStack';

    public function __construct()
    {
        Event::on(
            IntegrationsService::class,
            IntegrationsService::EVENT_REGISTER_INTEGRATION_TYPES,
            [$this, 'registerTypes']
        );

        Event::on(
            Form::class,
            Form::EVENT_SET_PROPERTIES,
            [$this, 'processOptions']
        );
    }

    public static function getCaptchaAttributes(Form $form): Attributes
    {
        $bag = $form->getProperties();
        $properties = $bag->get(self::KEY_CAPTCHA_PROPERTY_STACK, []);

        $attributes = new Attributes();
        foreach ($properties as $stack) {
            $attributes->merge($stack);
        }

        return $attributes;
    }

    public function registerTypes(RegisterIntegrationTypesEvent $event): void
    {
        $event->addType(ReCaptcha::class);
        $event->addType(hCaptcha::class);
    }

    public function processOptions(SetPropertiesEvent $event): void
    {
        $properties = $event->getProperties();
        if (!isset($properties[self::KEY_CAPTCHA_PROPERTIES])) {
            return;
        }

        $props = $properties[self::KEY_CAPTCHA_PROPERTIES];

        // Get the current property stack and add to the stack
        $form = $event->getForm();
        $stack = $form->getProperties()->get(self::KEY_CAPTCHA_PROPERTY_STACK, []);
        foreach ($stack as $stackItem) {
            if ($stackItem === $props) {
                return;
            }
        }

        $stack[] = $props;
        $form->getProperties()->set(self::KEY_CAPTCHA_PROPERTY_STACK, $stack);

        // Remove from current properties
        unset($properties[self::KEY_CAPTCHA_PROPERTIES]);
        $event->setProperties($properties);
    }
}
