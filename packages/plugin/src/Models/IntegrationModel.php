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
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationNotFoundException;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Library\Translations\CraftTranslator;
use Solspace\Freeform\Records\IntegrationRecord;

class IntegrationModel extends Model
{
    public ?int $id = null;
    public ?string $name = null;
    public ?string $handle = null;
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
        $freeform = Freeform::getInstance();

        switch ($this->type) {
            case IntegrationRecord::TYPE_MAILING_LIST:
                $logCategory = FreeformLogger::MAILING_LIST_INTEGRATION;
                $handler = $freeform->mailingLists;

                break;

            case IntegrationRecord::TYPE_CRM:
                $logCategory = FreeformLogger::CRM_INTEGRATION;
                $handler = $freeform->crm;

                break;

            case IntegrationRecord::TYPE_PAYMENT_GATEWAY:
                $logCategory = FreeformLogger::PAYMENT_GATEWAY;
                $handler = $freeform->paymentGateways;

                break;

            default:
                throw new IntegrationException(Freeform::t('Unknown integration type specified'));
        }

        $className = $this->class;

        if (!class_exists($className)) {
            throw new IntegrationNotFoundException(sprintf('"%s" class does not exist', $className));
        }

        return new $className(
            $this->id,
            $this->handle ?? '',
            $this->name ?? '',
            $this->lastUpdate,
            $this->metadata,
            FreeformLogger::getInstance($logCategory),
            new CraftTranslator(),
            $handler,
            \Craft::$container->get(PropertyProvider::class),
        );
    }

    public function getTypeSlug(): string
    {
        return match ($this->type) {
            IntegrationRecord::TYPE_PAYMENT_GATEWAY => 'payment-gateways',
            IntegrationRecord::TYPE_MAILING_LIST => 'mailing-lists',
            default => 'crm',
        };
    }
}
