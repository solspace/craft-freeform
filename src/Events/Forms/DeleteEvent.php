<?php

namespace Solspace\Freeform\Events\Forms;

use craft\events\CancelableEvent;
use Solspace\Freeform\Models\FormModel;

class DeleteEvent extends CancelableEvent
{
    /** @var FormModel */
    public $model;

    /**
     * @param FormModel $model
     */
    public function __construct(FormModel $model)
    {
        $this->model = $model;

        parent::__construct();
    }

    /**
     * @return FormModel
     */
    public function getModel(): FormModel
    {
        return $this->model;
    }

    /**
     * @deprecated use ::getModel() instead
     * @return FormModel
     */
    public function getRecord(): FormModel
    {
        return $this->model;
    }
}
