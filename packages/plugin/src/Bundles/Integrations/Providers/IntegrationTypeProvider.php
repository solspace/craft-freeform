<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use Solspace\Freeform\Attributes\EventListener;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Library\Helpers\AttributeHelper;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\Captchas\CaptchaIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\EmailMarketingIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\Webhooks\WebhookIntegrationInterface;

class IntegrationTypeProvider
{
    private static array $types = [];

    public function getTypeDefinition(string $integrationClass): ?Type
    {
        if (!isset(self::$types[$integrationClass])) {
            $reflectionClass = new \ReflectionClass($integrationClass);
            if (!$reflectionClass->implementsInterface(IntegrationInterface::class)) {
                return null;
            }

            $type = AttributeHelper::findAttribute($reflectionClass, Type::class);
            if (!$type) {
                return null;
            }

            $type->class = $integrationClass;
            $type->shortName = $reflectionClass->getShortName();

            $editions = AttributeHelper::findAttributes($reflectionClass, Edition::class);
            foreach ($editions as $edition) {
                $type->editions[] = $edition->name;
            }

            $eventListeners = $reflectionClass->getAttributes(EventListener::class);
            foreach ($eventListeners as $listener) {
                $listenerClass = $listener->newInstance()->class;
                \Craft::$container->get($listenerClass);
            }

            self::$types[$integrationClass] = $type;
        }

        return self::$types[$integrationClass];
    }

    public function getTypeShorthand(IntegrationInterface $integration): string
    {
        $reflection = new \ReflectionClass($integration);
        if ($reflection->implementsInterface(CRMIntegrationInterface::class)) {
            return IntegrationInterface::TYPE_CRM;
        }

        if ($reflection->implementsInterface(EmailMarketingIntegrationInterface::class)) {
            return IntegrationInterface::TYPE_EMAIL_MARKETING;
        }

        if ($reflection->implementsInterface(ElementIntegrationInterface::class)) {
            return IntegrationInterface::TYPE_ELEMENTS;
        }

        if ($reflection->implementsInterface(CaptchaIntegrationInterface::class)) {
            return IntegrationInterface::TYPE_CAPTCHAS;
        }

        if ($reflection->implementsInterface(WebhookIntegrationInterface::class)) {
            return IntegrationInterface::TYPE_WEBHOOKS;
        }

        return IntegrationInterface::TYPE_OTHER;
    }
}
