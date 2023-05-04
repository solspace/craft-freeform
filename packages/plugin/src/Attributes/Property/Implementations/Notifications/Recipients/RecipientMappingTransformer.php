<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Notifications\Recipients;

use Solspace\Freeform\Attributes\Property\Implementations\Notifications\NotificationTemplates\NotificationTemplateTransformer;
use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientMapping;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientMappingCollection;

class RecipientMappingTransformer implements TransformerInterface
{
    public function __construct(
        private RecipientTransformer $recipientTransformer,
        private NotificationTemplateTransformer $templateTransformer,
    ) {
    }

    public function transform($value): ?RecipientMappingCollection
    {
        $collection = new RecipientMappingCollection();

        if (\is_array($value)) {
            foreach ($value as $mapping) {
                $template = $this->templateTransformer->transform($mapping['template'] ?? null);
                $recipientCollection = $this->recipientTransformer->transform($mapping['recipients']);

                $mapping = new RecipientMapping(
                    $mapping['value'] ?? '',
                    $template,
                    $recipientCollection
                );

                $collection->add($mapping);
            }
        }

        return $collection;
    }

    public function reverseTransform($value): array
    {
        if (!$value instanceof RecipientMappingCollection) {
            return [];
        }

        $items = [];
        foreach ($value as $mapping) {
            $template = $this->templateTransformer->reverseTransform($mapping->getTemplate());
            $recipients = $this->recipientTransformer->reverseTransform($mapping->getRecipients());

            $items[] = [
                'value' => $mapping->getValue(),
                'template' => $template,
                'recipients' => $recipients,
            ];
        }

        return $items;
    }
}
