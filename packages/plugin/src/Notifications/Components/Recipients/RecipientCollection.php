<?php

namespace Solspace\Freeform\Notifications\Components\Recipients;

use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<Recipient>
 */
class RecipientCollection extends Collection
{
    public static function fromArray(array $recipients): self
    {
        $collection = new self();

        foreach ($recipients as $recipient) {
            $collection->add(new Recipient($recipient));
        }

        return $collection;
    }

    public function emailsToArray(): array
    {
        $recipients = [];
        foreach ($this->items as $recipient) {
            $recipients[] = trim($recipient->getEmail());
        }

        return array_filter($recipients);
    }
}
