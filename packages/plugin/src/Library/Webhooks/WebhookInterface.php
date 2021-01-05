<?php

namespace Solspace\Freeform\Library\Webhooks;

use Solspace\Freeform\Events\Forms\AfterSubmitEvent;

interface WebhookInterface
{
    /**
     * @return null|string
     */
    public function getWebhook();

    /**
     * @param mixed $defaultValue
     *
     * @return mixed
     */
    public function getSetting(string $name, $defaultValue = null);

    public function triggerWebhook(AfterSubmitEvent $event): bool;
}
