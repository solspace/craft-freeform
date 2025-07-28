<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use Solspace\Freeform\Attributes\EventListener;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\AttributeHelper;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class IntegrationTypeProvider
{
    private static array $types = [];

    public function getTypeDefinition(string $integrationClass): ?Type
    {
        if (!isset(self::$types[$integrationClass])) {
            try {
                $reflectionClass = new \ReflectionClass($integrationClass);
            } catch (\ReflectionException) {
                return null;
            }

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

    /**
     * @return Type[]
     */
    public function getAllTypeDefinitions(): array
    {
        return Freeform::getInstance()->integrations->getAllIntegrationTypes();
    }

    public function getTypeTitle(string $handle): string
    {
        return match ($handle) {
            'crm' => Freeform::t('CRM'),
            'email-marketing' => Freeform::t('Email Marketing'),
            'captchas' => Freeform::t('CAPTCHAs'),
            'elements' => Freeform::t('Elements'),
            'spam-blocking' => Freeform::t('Spam Blocking'),
            'payment-gateways' => Freeform::t('Payment Gateways'),
            'webhooks' => Freeform::t('Webhooks'),
            'single' => Freeform::t('General'),
            'other' => Freeform::t('Other'),
            default => $handle,
        };
    }
}
