<?php

namespace Solspace\Freeform\Events\Export\Notifications;

use craft\events\CancelableEvent;
use Solspace\Freeform\Records\Pro\ExportNotificationRecord;

class DeleteEvent extends CancelableEvent
{
    /** @var ExportNotificationRecord */
    private $record;

    public function __construct(ExportNotificationRecord $record)
    {
        $this->record = $record;

        parent::__construct();
    }

    public function getRecord(): ExportNotificationRecord
    {
        return $this->record;
    }
}
