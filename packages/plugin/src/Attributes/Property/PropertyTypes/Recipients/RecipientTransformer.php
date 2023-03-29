<?php

namespace Solspace\Freeform\Attributes\Property\PropertyTypes\Recipients;

use Solspace\Freeform\Attributes\Property\TransformerInterface;

class RecipientTransformer implements TransformerInterface
{
    public function transform($value): RecipientCollection
    {
        $collection = new RecipientCollection();
        foreach ($value as $recipient) {
            $collection->add(new Recipient($recipient['email'], $recipient['name']));
        }

        return $collection;
    }

    public function reverseTransform($value): array
    {
        $recipients = [];
        foreach ($value->getRecipients() as $recipient) {
            $recipients[] = [
                'email' => $recipient->getEmail(),
                'name' => $recipient->getName(),
            ];
        }

        return $recipients;
    }
}
