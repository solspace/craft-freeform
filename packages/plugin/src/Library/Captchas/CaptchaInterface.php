<?php

namespace Solspace\Freeform\Library\Captchas;

interface CaptchaInterface extends \JsonSerializable
{
    /**
     * Return the title of the captcha provider.
     */
    public static function getTitle(): string;
}
