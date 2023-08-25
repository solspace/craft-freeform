<?php

namespace Solspace\Freeform\Library\Integrations\Types\Webhooks;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

interface WebhookIntegrationInterface extends IntegrationInterface
{
    public function trigger(Form $form): void;
}
