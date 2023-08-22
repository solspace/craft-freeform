<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationTypeProvider;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Freeform;

class RegisterIntegrationTypesEvent extends ArrayableEvent
{
    /** @var Type[] */
    private array $types = [];
    private IntegrationTypeProvider $typeProvider;

    public function __construct($config = [])
    {
        $this->typeProvider = \Craft::$container->get(IntegrationTypeProvider::class);

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
        if (isset($this->types[$class])) {
            return $this;
        }

        $isPro = Freeform::getInstance()->isPro();
        if (!$isPro) {
            return $this;
        }

        $type = $this->typeProvider->getTypeDefinition($class);
        if (!$type) {
            return $this;
        }

        $this->types[$class] = $type;

        return $this;
    }
}
