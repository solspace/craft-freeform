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

    public function __construct(NotificationRecord $model, bool $new = false)
    {
        $this->new = $new;
        $this->record = $model;

        parent::__construct([]);
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['record', 'new']);
    }

    public function getRecord(): NotificationRecord
    {
        return $this->record;
    }

    public function isNew(): bool
    {
        return $this->new;
    }
}
