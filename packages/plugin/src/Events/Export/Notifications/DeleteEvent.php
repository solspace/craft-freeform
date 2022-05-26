<?php

namespace Solspace\Freeform\Events\Export\Notifications;

use craft\events\CancelableEvent;
use Solspace\Freeform\Records\Pro\ExportNotificationRecord;

class DeleteEvent extends CancelableEvent
{
    public function __construct(private ExportNotificationRecord $record)
    {
        parent::__construct();
    }

    public function getRecord(): ExportNotificationRecord
    {
        return $this->record;
    }
}
