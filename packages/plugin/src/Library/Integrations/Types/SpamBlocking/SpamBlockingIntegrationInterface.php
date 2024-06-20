<?php

namespace Solspace\Freeform\Library\Integrations\Types\SpamBlocking;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

interface SpamBlockingIntegrationInterface extends IntegrationInterface
{
    public function validate(Form $form, bool $displayErrors): void;
}
