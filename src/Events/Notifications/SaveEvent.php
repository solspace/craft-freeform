<?php

namespace Solspace\Freeform\Events\Notifications;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Records\NotificationRecord;

class SaveEvent extends CancelableArrayableEvent
{
    /** @var NotificationRecord */
    private $record;

    /** @var bool */
    private $new;

    /**
     * @param NotificationRecord $model
     * @param bool               $new
     */
    public function __construct(NotificationRecord $model, bool $new = false)
    {
        $this->new    = $new;
        $this->record = $model;

        parent::__construct([]);
    }

    /**
     * @inheritDoc
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['record', 'new']);
    }

    /**
     * @return NotificationRecord
     */
    public function getRecord(): NotificationRecord
    {
        return $this->record;
    }

    /**
     * @return bool
     */
    public function isNew(): bool
    {
        return $this->new;
    }
}
