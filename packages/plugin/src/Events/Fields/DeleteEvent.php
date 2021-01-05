<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Models\FieldModel;

class DeleteEvent extends CancelableArrayableEvent
{
    /** @var FieldModel */
    private $model;

    public function __construct(FieldModel $model)
    {
        $this->model = $model;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['model']);
    }

    public function getModel(): FieldModel
    {
        return $this->model;
    }
}
