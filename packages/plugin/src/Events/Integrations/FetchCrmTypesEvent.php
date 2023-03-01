<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegrationInterface;

class FetchCrmTypesEvent extends ArrayableEvent
{
    /** @var Type[] */
    private array $types = [];

    private PropertyProvider $propertyProvider;

    public function __construct($config = [])
    {
        $this->propertyProvider = \Craft::$container->get(PropertyProvider::class);

        parent::__construct($config);
    }

    public function fields(): array
    {
        return ['types'];
    }

    public function addType(string $class): self
    {
        $reflectionClass = new \ReflectionClass($class);

        $isPro = Freeform::getInstance()->isPro();
        if ($isPro && $reflectionClass->implementsInterface(CRMIntegrationInterface::class)) {
            $types = $reflectionClass->getAttributes(Type::class);
            $type = reset($types);

            if (!$type) {
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

    /**
     * @return Type[]
     */
    public function getTypes(): array
    {
        return $this->types;
    }
}
