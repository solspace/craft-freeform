<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2025, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Models;

use craft\base\Model;
use craft\helpers\UrlHelper;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationLoggerProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationTypeProvider;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationNotFoundException;
use Solspace\Freeform\Library\Helpers\StringHelper;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class IntegrationModel extends Model
{
    public ?int $id = null;
    public ?string $uid = null;
    public bool $enabled = false;
    public bool $legacy = false;
    public bool $connectionEstablished = false;
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
        $model->legacy = false;

        return $model;
    }

    public function safeAttributes(): array
    {
        return [
            'enabled',
            'legacy',
            'connectionEstablished',
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

    public function getTypeDefinition(): Type
    {
        $object = $this->getIntegrationObject();
        $type = $object->getTypeDefinition();

        $propertyProvider = \Craft::$container->get(PropertyProvider::class);

        $type->properties = $propertyProvider->getEditableProperties($object, $object);

        return $type;
    }

    public function getIntegrationObject(): IntegrationInterface
    {
        $className = $this->class;

        if (!class_exists($className)) {
            throw new IntegrationNotFoundException(\sprintf('"%s" class does not exist', $className));
        }

        $typeProvider = \Craft::$container->get(IntegrationTypeProvider::class);
        $loggerProvider = \Craft::$container->get(IntegrationLoggerProvider::class);

        $type = $typeProvider->getTypeDefinition($className);
        $logger = $loggerProvider->getLogger($type);

        $object = new $className(
            $this->id,
            $this->uid,
            $this->enabled,
            $this->legacy,
            $this->handle ?? '',
            $this->name ?? '',
            $type,
            $logger,
        );

        $propertyProvider = \Craft::$container->get(PropertyProvider::class);
        $properties = $propertyProvider->getEditableProperties($object);
        foreach ($properties as $property) {
            if ($property->hasFlag(IntegrationInterface::FLAG_READONLY) && $property->valueGenerator) {
                $value = $property->valueGenerator->generateValue(null, $this);
                $propertyProvider->setObjectValue($object, $property->handle, $value);
            }
        }

        $propertyProvider->setObjectProperties($object, $this->metadata, [$this, 'propertyUpdateCallback']);

        return $object;
    }

    public function propertyUpdateCallback(mixed $value, ?Property $property): mixed
    {
        static $securityKey;

        if (null === $property) {
            return $value;
        }

        if (null === $securityKey) {
            $securityKey = \Craft::$app->getConfig()->getGeneral()->securityKey;
        }

        if ($property->hasFlag(IntegrationInterface::FLAG_ENCRYPTED)) {
            $isEnvVariable = StringHelper::isEnvVariable($value);
            if ($isEnvVariable) {
                return $value;
            }

            return \Craft::$app->security->decryptByKey(base64_decode($value), $securityKey);
        }

        if ($property->hasFlag(IntegrationInterface::FLAG_READONLY)) {
            return null;
        }

        return $value;
    }
}
