<?php

namespace Solspace\Freeform\Events\Fields;

use craft\events\CancelableEvent;
use Solspace\Freeform\Models\FieldModel;

class DeleteEvent extends CancelableEvent
{
    /** @var FieldModel */
    private $model;

    /**
     * @param FieldModel $model
     */
    public function __construct(FieldModel $model)
    {
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
}
