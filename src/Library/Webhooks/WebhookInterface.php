<?php

namespace Solspace\Freeform\Library\Webhooks;

use Solspace\Freeform\Events\Forms\AfterSubmitEvent;

interface WebhookInterface
{
    /**
     * @return string|null
     */
    public function getWebhook();

    /**
     * @param string $name
     * @param mixed  $defaultValue
     *
     * @return mixed
     */
    public function getSetting(string $name, $defaultValue = null);

    /**
     * @param AfterSubmitEvent $event
     *
     * @return bool
     */
    public function triggerWebhook(AfterSubmitEvent $event): bool;
}
