<?php

namespace Solspace\Freeform\Fields;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\RecaptchaInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\SingleValueTrait;
use Solspace\Freeform\Models\Settings;

class RecaptchaField extends AbstractField implements NoStorageInterface, SingleValueInterface, InputOnlyInterface, RecaptchaInterface
{
    use SingleValueTrait;

    /**
     * {@inheritDoc}
     */
    public function getType(): string
    {
        return self::TYPE_RECAPTCHA;
    }

    /**
     * {@inheritDoc}
     */
    public function getHandle()
    {
        return 'grecaptcha_'.$this->getHash();
    }

    /**
     * {@inheritDoc}
     */
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
                return '';

            case Settings::RECAPTCHA_TYPE_V2_CHECKBOX:
            default:
                $output = '<div class="g-recaptcha" '
                    .'data-sitekey="'.($key ?: 'invalid').'" '
                    .'data-theme="'.$theme.'" '
                    .'data-size="'.$size.'" '
                    .'></div>'
                    .'<input type="hidden" '
                    .'name="'.$this->getHandle().'" '
                    .$this->getInputAttributesString()
                    .'/>';

                return $output;
        }
    }
}
