<?php

namespace Solspace\Freeform\Integrations\Captchas\ReCaptcha;

class ReCaptchaVerificationResult
{
    public function __construct(public array $errors = [], public bool $serviceError = false) {}
}
