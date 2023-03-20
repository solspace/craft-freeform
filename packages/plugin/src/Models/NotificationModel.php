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
use Solspace\Freeform\Library\Exceptions\Notifications\NotificationException;
use Solspace\Freeform\Library\Exceptions\Notifications\NotificationNotFoundException;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Library\Notifications\NotificationInterface;
use Solspace\Freeform\Library\Translations\CraftTranslator;
use Solspace\Freeform\Records\NotificationRecord;

class NotificationModel extends Model
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

    public function getNotificationObject(): NotificationInterface
    {
        $freeform = Freeform::getInstance();

        switch ($this->type) {
            case NotificationRecord::TYPE_ADMIN:
                $logCategory = FreeformLogger::ADMIN_NOTIFICATION;
                $handler = $freeform->adminNotifications;

                break;

            case NotificationRecord::TYPE_CONDITIONAL:
                $logCategory = FreeformLogger::CONDITIONAL_NOTIFICATION;
                $handler = $freeform->conditionalNotifications;

                break;

            default:
                throw new NotificationException(Freeform::t('Unknown notification type specified'));
        }

        $className = $this->class;

        if (!class_exists($className)) {
            throw new NotificationNotFoundException(sprintf('"%s" class does not exist', $className));
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
            NotificationRecord::TYPE_CONDITIONAL => 'conditional',
            default => 'admin',
        };
    }
}
