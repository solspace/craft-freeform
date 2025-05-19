<?php

namespace Solspace\Freeform\Events\Notifications;

use craft\events\CancelableEvent;
use Solspace\Freeform\Records\Notifications\NotificationWrapperRecord;

class SaveWrapperEvent extends CancelableEvent
{
    private bool $new;

    public function __construct(
        private NotificationWrapperRecord $record,
    ) {
        $this->new = (bool) $record->id;

        parent::__construct([]);
    }

    public function getRecord(): NotificationWrapperRecord
    {
        return $this->record;
    }

    public function isNew(): bool
    {
        return $this->new;
    }
}
