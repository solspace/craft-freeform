<?php

namespace Solspace\Freeform\Events\Notifications;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Records\NotificationTemplateRecord;

class SaveEvent extends CancelableArrayableEvent
{
    /** @var NotificationTemplateRecord */
    private $record;

    /** @var bool */
    private $new;

    public function __construct(NotificationTemplateRecord $model, bool $new = false)
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

    public function getRecord(): NotificationTemplateRecord
    {
        return $this->record;
    }

    public function isNew(): bool
    {
        return $this->new;
    }
}
