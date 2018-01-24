<?php

namespace Solspace\Freeform\Events\Notifications;

use craft\events\CancelableEvent;
use Solspace\Freeform\Records\NotificationRecord;

class DeleteEvent extends CancelableEvent
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
     * @return NotificationRecord
     */
    public function getRecord(): NotificationRecord
    {
        return $this->record;
    }
}
