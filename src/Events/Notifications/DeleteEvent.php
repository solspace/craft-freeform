<?php

namespace Solspace\Freeform\Events\Notifications;

use craft\events\CancelableEvent;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Records\NotificationRecord;

class DeleteEvent extends CancelableArrayableEvent
{
    /** @var NotificationRecord */
    private $record;

    /**
     * @param NotificationRecord $model
     */
    public function __construct(NotificationRecord $model)
    {
        $this->record = $model;

        parent::__construct([]);
    }

    /**
     * @inheritDoc
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['record']);
    }

    /**
     * @return NotificationRecord
     */
    public function getRecord(): NotificationRecord
    {
        return $this->record;
    }
}
