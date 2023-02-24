<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Library\DataObjects\Integrations\Integration;
use Solspace\Freeform\Library\DataObjects\Integrations\IntegrationCategory;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Records\IntegrationRecord;

class IntegrationDTOProvider
{
    private const TYPE_MAP = [
        IntegrationRecord::TYPE_CRM => 'CRM',
        IntegrationRecord::TYPE_MAILING_LIST => 'Email Marketing',
        IntegrationRecord::TYPE_PAYMENT_GATEWAY => 'Payments',
    ];

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

    /**
     * @param IntegrationModel[] $models
     *
     * @return IntegrationCategory[]
     */
    public function convertCategorized(array $models): array
    {
        $categories = [];
        foreach ($models as $model) {
            if (!isset($categories[$model->type])) {
                $category = new IntegrationCategory();
                $category->type = $model->type;
                $category->label = self::TYPE_MAP[$model->type];
                $category->children = [];

                $categories[$model->type] = $category;
            }

            $dto = $this->createDtoFromModel($model);

            $category = $categories[$model->type];
            $category->children[] = $dto;
        }

        return array_values($categories);
    }

    private function createDTOFromModel(IntegrationModel $model): ?Integration
    {
        /** @var IntegrationInterface $class */
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
        $dto->type = $model->type;
        $dto->icon = $icon;
        $dto->properties = $this->propertyProvider->getEditableProperties($class);

        return $dto;
    }
}
