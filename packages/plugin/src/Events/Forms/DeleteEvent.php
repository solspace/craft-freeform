<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Models\FormModel;

class DeleteEvent extends CancelableArrayableEvent
{
    /** @var FormModel */
    private $model;

    public function __construct(FormModel $model)
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

    public function getModel(): FormModel
    {
        return $this->model;
    }

    /**
     * @deprecated use ::getModel() instead
     */
    public function getRecord(): FormModel
    {
        return $this->model;
    }
}
