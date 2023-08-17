<?php

namespace Solspace\Freeform\Events\Files;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Fields\Implementations\FileUploadField;

class UploadEvent extends CancelableArrayableEvent
{
    /** @var FileUploadField */
    private $field;

    public function __construct(FileUploadField $field)
    {
        $this->field = $field;

        parent::__construct([]);
    }

    public function fields(): array
    {
        return array_merge(parent::fields(), ['field']);
    }

    public function getField(): FileUploadField
    {
        return $this->field;
    }
}
