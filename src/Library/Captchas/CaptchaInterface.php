<?php

namespace Solspace\Freeform\Library\Captchas;

interface CaptchaInterface extends \JsonSerializable
{
    /**
     * Return the title of the captcha provider
     *
     * @return string
     */
    public static function getTitle(): string;
}