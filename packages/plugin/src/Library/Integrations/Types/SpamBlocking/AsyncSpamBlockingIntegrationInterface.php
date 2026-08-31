<?php

namespace Solspace\Freeform\Library\Integrations\Types\SpamBlocking;

interface AsyncSpamBlockingIntegrationInterface extends SpamBlockingIntegrationInterface
{
    /**
     * When true, emails/CRM/webhooks/etc. wait until this async spam check finishes.
     */
    public function shouldDeferPostProcess(): bool;
}
