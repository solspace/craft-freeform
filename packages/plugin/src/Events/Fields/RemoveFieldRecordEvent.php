<?php

namespace Solspace\Freeform\Events\Fields;

use craft\events\CancelableEvent;
use Solspace\Freeform\Records\Form\FormFieldRecord;

class RemoveFieldRecordEvent extends CancelableEvent
{
    public function __construct(private FormFieldRecord $record)
    {
        parent::__construct();
    }

    public function getRecord(): FormFieldRecord
    {
        return $this->record;
    }
}
