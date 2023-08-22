<?php

namespace Solspace\Freeform\Library\Integrations\Types\Captchas;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

interface CaptchaIntegrationInterface extends IntegrationInterface
{
    public function validate(Form $form): bool;

    public function getErrorMessage(): string;
}
