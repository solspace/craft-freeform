<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use Solspace\Freeform\Attributes\EventListener;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\Captchas\CaptchaIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\EmailMarketingIntegrationInterface;

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

            $types = $reflectionClass->getAttributes(Type::class);
            $type = reset($types);
            if (!$type) {
                return null;
            }

            $type = $type->newInstance();

            $type->class = $integrationClass;
            $type->shortName = $reflectionClass->getShortName();

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

        return IntegrationInterface::TYPE_OTHER;
    }
}
