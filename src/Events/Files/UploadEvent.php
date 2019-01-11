<?php

namespace Solspace\Freeform\Events\Files;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Fields\FileUploadField;

class UploadEvent extends CancelableArrayableEvent
{
    /** @var FileUploadField */
    private $field;

    /**
     * @param FileUploadField $field
     */
    public function __construct(FileUploadField $field)
    {
        $this->field = $field;

        parent::__construct([]);
    }

    /**
     * @inheritDoc
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['field']);
    }

    /**
     * @return FileUploadField
     */
    public function getField(): FileUploadField
    {
        return $this->field;
    }
}
