<?php

namespace Solspace\Freeform\Fields\Implementations;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Interfaces\RecaptchaInterface;
use Solspace\Freeform\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Fields\Traits\SingleValueTrait;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Models\Settings;

#[Type(
    name: 'reCAPTCHA',
    typeShorthand: 'recaptcha',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class RecaptchaField extends AbstractField implements NoStorageInterface, SingleValueInterface, InputOnlyInterface, RecaptchaInterface
{
    use SingleValueTrait;

    public function getType(): string
    {
        return self::TYPE_RECAPTCHA;
    }

    public function getHandle(): ?string
    {
        return 'grecaptcha_'.$this->getHash();
    }

    protected function getInputHtml(): string
    {
        /** @var Settings $settings */
        $settings = Freeform::getInstance()->getSettings();

        $key = \Craft::parseEnv($settings->recaptchaKey);
        $type = $settings->getRecaptchaType();
        $theme = $settings->getRecaptchaTheme();
        $size = $settings->getRecaptchaSize();

        switch ($type) {
            case Settings::RECAPTCHA_TYPE_V3:
            case Settings::RECAPTCHA_TYPE_V2_INVISIBLE:
            case Settings::RECAPTCHA_TYPE_H_INVISIBLE:
                return '';

            case Settings::RECAPTCHA_TYPE_V2_CHECKBOX:
            case Settings::RECAPTCHA_TYPE_H_CHECKBOX:
            default:
                $class = Settings::RECAPTCHA_TYPE_H_CHECKBOX === $type ? 'h-captcha' : 'g-recaptcha';

                return '<div class="'.$class.'" '
                    .'data-sitekey="'.($key ?: 'invalid').'" '
                    .'data-theme="'.$theme.'" '
                    .'data-size="'.$size.'" '
                    .'></div>'
                    .'<input type="hidden" '
                    .'name="'.$this->getHandle().'" '
                    .$this->getInputAttributesString()
                    .'/>';
        }
    }
}
