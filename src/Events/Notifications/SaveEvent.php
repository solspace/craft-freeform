<?php

namespace Solspace\Freeform\Events\Notifications;

use craft\events\CancelableEvent;
use Solspace\Freeform\Records\NotificationRecord;

class SaveEvent extends CancelableEvent
{
    /** @var NotificationRecord */
    public $record;

    /** @var bool */
    public $new;

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
