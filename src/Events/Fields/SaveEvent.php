<?php

namespace Solspace\Freeform\Events\Fields;

use craft\events\CancelableEvent;
use Solspace\Freeform\Models\FieldModel;
use Solspace\Freeform\Records\FieldRecord;

class SaveEvent extends CancelableEvent
{
    /** @var FieldModel */
    private $model;

    /** @var bool */
    private $new;

    /**
     * @param FieldModel $model
     * @param bool       $new
     */
    public function __construct(FieldModel $model, bool $new = false)
    {
        $this->new   = $new;
        $this->model = $model;

        parent::__construct();
    }

    /**
     * @return FieldModel
     */
    public function getModel(): FieldModel
    {
        return $this->model;
    }

    /**
     * @return bool
     */
    public function isNew(): bool
    {
        return $this->new;
    }
}
