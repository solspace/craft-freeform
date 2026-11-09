<?php

namespace Solspace\Freeform\Integrations\Captchas;

class CaptchaVerificationResult
{
    public function __construct(public array $errors = [], public bool $serviceError = false, public array $data = []) {}
}
