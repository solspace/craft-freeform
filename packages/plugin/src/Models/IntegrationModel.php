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
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationNotFoundException;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class IntegrationModel extends Model
{
    public ?int $id = null;
    public ?string $name = null;
    public ?string $handle = null;
    public ?bool $enabled = null;
    public ?string $type = null;
    public ?string $class = null;
    public array $metadata = [];
    public \DateTime $lastUpdate;

    public static function create(string $type): self
    {
        $model = new self();
        $model->type = $type;
        $model->lastUpdate = new \DateTime();

        return $model;
    }

    public function safeAttributes(): array
    {
        return [
            'name',
            'handle',
            'class',
            'metadata',
            'forceUpdate',
            'lastUpdate',
        ];
    }

    public function getCpEditUrl(): string
    {
        $id = $this->id;
        $type = $this->getTypeSlug();

        return UrlHelper::cpUrl("freeform/settings/{$type}/{$id}");
    }

    public function getIntegrationObject(): IntegrationInterface
    {
        $className = $this->class;

        if (!class_exists($className)) {
            throw new IntegrationNotFoundException(sprintf('"%s" class does not exist', $className));
        }

        $object = new $className(
            $this->id,
            (bool) $this->enabled,
            $this->handle ?? '',
            $this->name ?? '',
            $this->lastUpdate,
            $this->metadata,
        );

        $propertyProvider = \Craft::$container->get(PropertyProvider::class);
        $propertyProvider->setObjectProperties($object, $this->metadata, [$this, 'propertyUpdateCallback']);

        return $object;
    }

    public function getTypeSlug(): string
    {
        return match ($this->type) {
            IntegrationInterface::TYPE_PAYMENT_GATEWAY => 'payment-gateways',
            IntegrationInterface::TYPE_MAILING_LIST => 'mailing-lists',
            default => 'crm',
        };
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
