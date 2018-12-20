<?php

namespace Solspace\Freeform\Events\Files;

use craft\events\CancelableEvent;
use Solspace\Freeform\Library\Composer\Components\Fields\FileUploadField;

class UploadEvent extends CancelableEvent
{
    /** @var FileUploadField */
    public $field;

    /**
     * @param FileUploadField $field
     */
    public function __construct(FileUploadField $field)
    {
        $this->field = $field;

        parent::__construct([]);
    }

    /**
     * @return FileUploadField
     */
    public function getField(): FileUploadField
    {
        return $this->field;
    }
}
