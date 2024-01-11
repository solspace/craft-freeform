<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\NotificationTemplates;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTemplateProvider;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;

class NotificationTemplateTransformer implements TransformerInterface
{
    public function __construct(private NotificationTemplateProvider $provider) {}

    public function transform($value): ?NotificationTemplate
    {
        if (is_numeric($value)) {
            return $this->provider->getDatabaseNotificationTemplate((int) $value);
        }

        if (\is_string($value) && $value) {
            return $this->provider->getFileNotificationTemplate($value);
        }

        return null;
    }

    public function reverseTransform($value): null|int|string
    {
        if (!$value instanceof NotificationTemplate) {
            return null;
        }

        return $value->getId();
    }
}
