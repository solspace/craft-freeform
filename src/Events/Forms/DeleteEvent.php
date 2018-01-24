<?php

namespace Solspace\Freeform\Events\Forms;

use craft\events\CancelableEvent;
use Solspace\Freeform\Models\FormModel;
use Solspace\Freeform\Records\FormRecord;

class DeleteEvent extends CancelableEvent
{
    /** @var FormModel */
    private $model;

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
    public function getRecord(): FormModel
    {
        return $this->model;
    }
}
