<?php

namespace Solspace\Freeform\Library\Webhooks;

interface WebhookInterface
{
    /**
     * @return int|null
     */
    public function getId();

    /**
     * @return string|null
     */
    public function getName();

    /**
     * @return string|null
     */
    public function getWebhook();
}
