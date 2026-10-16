<?php

namespace Solspace\Freeform\Notifications\Components\Recipients;

use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<Recipient>
 */
class RecipientCollection extends Collection
{
    public static function fromArray(array $recipients, bool $isTemplate = false): self
    {
        $collection = new self();

        foreach ($recipients as $recipient) {
            $collection->add(new Recipient($recipient, isTemplate: $isTemplate));
        }

        return $collection;
    }

    /**
     * Only explicitly configured templates may be passed to the renderer.
     * Submitted addresses and rendered output must remain literal values.
     *
     * @param null|callable(string): string $templateRenderer
     */
    public function emailsToArray(?callable $templateRenderer = null): array
    {
        $recipients = [];
        foreach ($this->items as $recipient) {
            $email = trim($recipient->getEmail());
            if ($email && $templateRenderer && $recipient->isTemplate()) {
                $email = $templateRenderer($email);
            }

            $recipients[] = $email;
        }

        return array_filter($recipients);
    }
}
