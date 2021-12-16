<?php

namespace Solspace\Freeform\Library\Webhooks;

use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;

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

    public function triggerWebhook(ProcessSubmissionEvent $event): bool;
}
