<?php

namespace Solspace\Freeform\Events\Notifications;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Records\NotificationRecord;

class DeleteEvent extends CancelableArrayableEvent
{
    /** @var NotificationRecord */
    private $record;

    public function __construct(NotificationRecord $model)
    {
        $this->record = $model;

        parent::__construct([]);
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['record']);
    }

    public function getRecord(): NotificationRecord
    {
        return $this->record;
    }
}
