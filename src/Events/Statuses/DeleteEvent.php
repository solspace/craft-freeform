<?php

namespace Solspace\Freeform\Events\Statuses;

use craft\events\CancelableEvent;
use Solspace\Freeform\Models\StatusModel;
use Solspace\Freeform\Records\StatusRecord;

class DeleteEvent extends CancelableEvent
{
    /** @var StatusModel */
    private $model;

    /**
     * @param StatusModel $model
     */
    public function __construct(StatusModel $model)
    {
        $this->model = $model;

        parent::__construct();
    }

    /**
     * @return StatusModel
     */
    public function getModel(): StatusModel
    {
        return $this->model;
    }
}
