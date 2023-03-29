<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Library\DataObjects\Integrations\Integration;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;

class IntegrationDTOProvider
{
    public function __construct(private PropertyProvider $propertyProvider)
    {
    }

    public function convertOne(IntegrationModel $model): ?Integration
    {
        return $this->createDtoFromModel($model);
    }

    /**
     * @param IntegrationModel[] $models
     *
     * @return Integration[]
     */
    public function convert(array $models): array
    {
        return array_filter(
            array_map(
                fn ($model) => $this->createDTOFromModel($model),
                $models
            )
        );
    }

    private function createDTOFromModel(IntegrationModel $model): ?Integration
    {
        $class = $model->class;

        $reflection = new \ReflectionClass($class);

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
        $dto->id = $model->id;
        $dto->name = $model->name;
        $dto->handle = $model->handle;
        $dto->enabled = (bool) $model->enabled;
        $dto->type = $model->type;
        $dto->icon = $icon;
        $dto->properties = $this->propertyProvider->getEditableProperties($class, $model->getIntegrationObject());
        $dto->properties->removeFlagged(
            IntegrationInterface::FLAG_INTERNAL,
            IntegrationInterface::FLAG_GLOBAL_PROPERTY,
        );

        return $dto;
    }
}
