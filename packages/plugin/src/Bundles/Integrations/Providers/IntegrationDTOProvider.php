<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Library\DataObjects\Integrations\Integration;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;

class IntegrationDTOProvider
{
    public function __construct(
        private PropertyProvider $propertyProvider,
        private IntegrationTypeProvider $typeProvider,
    ) {
    }

    public function convertOne(IntegrationModel $model): ?Integration
    {
        return $this->createDtoFromModel($model);
    }

    /**
     * @param IntegrationInterface[] $integrations
     *
     * @return Integration[]
     */
    public function convert(array $integrations): array
    {
        return array_filter(
            array_map(
                fn ($model) => $this->createDTOFromModel($model),
                $integrations
            )
        );
    }

    private function createDTOFromModel(IntegrationInterface $integration): ?Integration
    {
        $reflection = new \ReflectionClass($integration);

        $typeAttributes = $reflection->getAttributes(Type::class);
        $type = reset($typeAttributes);

        $type = $type ? $type->newInstance() : null;

        /** @var Type $type */
        if (!$type) {
            return null;
        }

        $icon = $type->iconPath;
        if ($icon) {
            [$_, $icon] = \Craft::$app->assetManager->publish($icon);
        }

        $dto = new Integration();
        $dto->id = $integration->getId();
        $dto->name = $integration->getName();
        $dto->handle = $integration->getHandle();
        $dto->enabled = (bool) $integration->isEnabled();
        $dto->type = $this->typeProvider->getTypeShorthand($integration);
        $dto->icon = $icon;
        $dto->properties = $this->propertyProvider->getEditableProperties($integration);
        $dto->properties->removeFlagged(
            IntegrationInterface::FLAG_INTERNAL,
            IntegrationInterface::FLAG_GLOBAL_PROPERTY,
        );

        foreach ($dto->properties as $index => $property) {
            if ($property->hasFlag(IntegrationInterface::FLAG_AS_HIDDEN_IN_INSTANCE)) {
                $property->type = 'hidden';
            }
        }

        return $dto;
    }
}
