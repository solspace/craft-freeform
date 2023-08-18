<?php

namespace Solspace\Freeform\Events\Notifications;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Records\NotificationTemplateRecord;

class DeleteEvent extends CancelableArrayableEvent
{
    /** @var NotificationTemplateRecord */
    private $record;

    public function __construct(NotificationTemplateRecord $model)
    {
        $this->record = $model;

        parent::__construct([]);
    }

    public function fields(): array
    {
        return array_merge(parent::fields(), ['record']);
    }

    public function getRecord(): NotificationTemplateRecord
    {
        return $this->record;
    }
}
