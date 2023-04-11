<?php

namespace Solspace\Freeform\Notifications\Components\Recipients;

use Solspace\Freeform\Library\DataObjects\NotificationTemplate;

class RecipientMapping
{
    public function __construct(
        private string $value,
        private ?NotificationTemplate $template,
        private RecipientCollection $recipients,
    ) {
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function getTemplate(): ?NotificationTemplate
    {
        return $this->template;
    }

    public function getRecipients(): RecipientCollection
    {
        return $this->recipients;
    }
}
