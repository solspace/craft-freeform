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

namespace Solspace\Freeform\Models;

use craft\base\Model;
use craft\helpers\UrlHelper;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationTypeProvider;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationNotFoundException;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class IntegrationModel extends Model
{
    public ?int $id = null;
    public bool $enabled = false;
    public ?string $name = null;
    public ?string $handle = null;
    public ?string $type = null;
    public ?string $class = null;
    public array $metadata = [];

    public static function create(string $type): self
    {
        $model = new self();
        $model->type = $type;
        $model->enabled = true;

        return $model;
    }

    public function safeAttributes(): array
    {
        return [
            'enabled',
            'name',
            'handle',
            'class',
            'metadata',
        ];
    }

    public function getCpEditUrl(): string
    {
        $id = $this->id;
        $type = $this->type;

        return UrlHelper::cpUrl("freeform/settings/{$type}/{$id}");
    }

    public function getIntegrationObject(): IntegrationInterface
    {
        $className = $this->class;

        if (!class_exists($className)) {
            throw new IntegrationNotFoundException(sprintf('"%s" class does not exist', $className));
        }

        $typeProvider = \Craft::$container->get(IntegrationTypeProvider::class);
        $type = $typeProvider->getTypeDefinition($className);

        $object = new $className(
            $this->id,
            (bool) $this->enabled,
            $this->handle ?? '',
            $this->name ?? '',
            $type,
        );

        $propertyProvider = \Craft::$container->get(PropertyProvider::class);
        $propertyProvider->setObjectProperties($object, $this->metadata, [$this, 'propertyUpdateCallback']);

        return $object;
    }

    public function propertyUpdateCallback(mixed $value, Property $property): mixed
    {
        static $securityKey;
        if (null === $securityKey) {
            $securityKey = \Craft::$app->getConfig()->getGeneral()->securityKey;
        }

        if ($property->hasFlag(IntegrationInterface::FLAG_ENCRYPTED)) {
            return \Craft::$app->security->decryptByKey(base64_decode($value), $securityKey);
        }

        return $value;
    }
}
