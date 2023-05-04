<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Notifications\Recipients;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Notifications\Components\Recipients\Recipient;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;

class RecipientTransformer implements TransformerInterface
{
    public function transform($value): RecipientCollection
    {
        $collection = new RecipientCollection();

        if (null === $value) {
            return $collection;
        }

        foreach ($value as $recipient) {
            $collection->add(new Recipient($recipient['email'], $recipient['name']));
        }

        return $collection;
    }

    public function reverseTransform($value): array
    {
        $recipients = [];
        foreach ($value->all() as $recipient) {
            $recipients[] = [
                'email' => $recipient->getEmail(),
                'name' => $recipient->getName(),
            ];
        }

        return $recipients;
    }
}
