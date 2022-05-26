<?php

namespace Solspace\Freeform\Events\Export\Notifications;

use craft\events\CancelableEvent;
use Solspace\Freeform\Records\Pro\ExportNotificationRecord;
use Solspace\Freeform\Records\Pro\ExportProfileRecord;

class SaveEvent extends CancelableEvent
{
    /** @var ExportProfileRecord */
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
