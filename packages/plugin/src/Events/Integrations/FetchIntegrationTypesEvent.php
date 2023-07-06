<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Freeform;

abstract class FetchIntegrationTypesEvent extends ArrayableEvent
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

    /**
     * @return Type[]
     */
    public function getTypes(): array
    {
        return $this->types;
    }

    public function addType(string $class): self
    {
        $reflectionClass = new \ReflectionClass($class);

        $isPro = Freeform::getInstance()->isPro();
        if (!$isPro) {
            return $this;
        }

        if (!$this->validateType($class)) {
            return $this;
        }

        $types = $reflectionClass->getAttributes(Type::class);
        $type = reset($types);
        if (!$type) {
            return $this;
        }

        $type = $type->newInstance();

        $properties = $this->propertyProvider->getEditableProperties($class);
        $type->setProperties($properties);
        $type->class = $class;
        $type->shortName = $reflectionClass->getShortName();

        $this->types[$class] = $type;

        return $this;
    }

    abstract protected function validateType(string $class): bool;
}