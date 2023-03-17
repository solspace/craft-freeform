<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Bundles\Notifications\Providers;

use Solspace\Freeform\Attributes\Notification\Type;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Library\DataObjects\Notifications\Notification;
use Solspace\Freeform\Library\DataObjects\Notifications\NotificationCategory;
use Solspace\Freeform\Library\Notifications\NotificationInterface;
use Solspace\Freeform\Models\NotificationModel;
use Solspace\Freeform\Records\NotificationRecord;

class NotificationDTOProvider
{
    private const TYPE_MAP = [
        NotificationRecord::TYPE_ADMIN => 'Admin',
        NotificationRecord::TYPE_CONDITIONAL => 'Conditional',
    ];

    public function __construct(private PropertyProvider $propertyProvider)
    {
    }

    public function convertOne(NotificationModel $model): ?Notification
    {
        return $this->createDtoFromModel($model);
    }

    /**
     * @param NotificationModel[] $models
     *
     * @return Notification[]
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
     * @param NotificationModel[] $models
     *
     * @return NotificationCategory[]
     */
    public function convertCategorized(array $models): array
    {
        $categories = [];
        foreach ($models as $model) {
            if (!isset($categories[$model->type])) {
                $category = new NotificationCategory();
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

    private function createDTOFromModel(NotificationModel $model): ?Notification
    {
        /** @var NotificationInterface $class */
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

        $dto = new Notification();
        $dto->id = $model->id;
        $dto->name = $model->name;
        $dto->handle = $model->handle;
        $dto->enabled = (bool) $model->enabled;
        $dto->type = $model->type;
        $dto->icon = $icon;
        $dto->properties = $this->propertyProvider->getEditableProperties($class, $model->getNotificationObject());
        $dto->properties->removeFlagged(
            NotificationInterface::FLAG_INTERNAL,
            NotificationInterface::FLAG_GLOBAL_PROPERTY,
        );

        return $dto;
    }
}
