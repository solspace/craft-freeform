<?php

namespace Solspace\Freeform\Webhooks\Integrations;

use Solspace\Freeform\Library\Webhooks\AbstractWebhook;

class Slack extends AbstractWebhook
{
    /**
     * @return string|null
     */
    public function getMessage()
    {
        return $this->getSetting('message');
    }
}
