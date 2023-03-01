<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\MailingListIntegrationInterface;

class FetchMailingListTypesEvent extends ArrayableEvent
{
    /** @var Type[] */
    private array $types = [];

    private PropertyProvider $propertyProvider;

    /**
     * MailingListTypesEvent constructor.
     */
    public function __construct()
    {
        $this->propertyProvider = \Craft::$container->get(PropertyProvider::class);

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['types'];
    }

    public function addType(string $class): self
    {
        $reflectionClass = new \ReflectionClass($class);

        $isPro = Freeform::getInstance()->isPro();
        if ($isPro && $reflectionClass->implementsInterface(MailingListIntegrationInterface::class)) {
            $types = $reflectionClass->getAttributes(Type::class);
            $type = reset($types);

            if (!$type) {
                return $this;
            }

            if (!$class::isInstallable() || !Freeform::getInstance()->isPro()) {
                return $this;
            }

            /** @var Type $type */
            $type = $type->newInstance();

            $properties = $this->propertyProvider->getEditableProperties($class);
            $type->setProperties($properties);
            $type->class = $class;

            $this->types[$class] = $type;
        }

        return $this;
    }

    public function getTypes(): array
    {
        return $this->types;
    }
}
