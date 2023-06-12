<?php

namespace Solspace\Freeform\Fields\Implementations;

use craft\helpers\App;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Interfaces\RecaptchaInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Models\Settings;

#[Type(
    name: 'reCAPTCHA',
    typeShorthand: 'recaptcha',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class RecaptchaField extends AbstractField implements NoStorageInterface, InputOnlyInterface, RecaptchaInterface
{
    public function getType(): string
    {
        return self::TYPE_RECAPTCHA;
    }

    public function getHandle(): ?string
    {
        return 'grecaptcha_'.$this->getHash();
    }

    public function includeInGqlSchema(): bool
    {
        return false;
    }

    protected function getInputHtml(): string
    {
        /** @var Settings $settings */
        $settings = Freeform::getInstance()->getSettings();

        $key = App::parseEnv($settings->recaptchaKey);
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

                $attributes = (new Attributes())
                    ->set('class', $class)
                    ->set('data-sitekey', $key ?: 'invalid')
                    ->set('data-theme', $theme)
                    ->set('data-size', $size)
                ;

                $inputAttributes = $this->attributes->getInput()
                    ->clone()
                    ->setIfEmpty('name', $this->getHandle())
                ;

                return '<div'.$attributes.'></div>'
                    .'<input'.$inputAttributes.' />';
        }
    }
}
