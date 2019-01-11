<?php

namespace Solspace\Freeform\Events\Statuses;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Models\StatusModel;

class DeleteEvent extends CancelableArrayableEvent
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
     * @inheritDoc
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['model']);
    }

    /**
     * @return StatusModel
     */
    public function getModel(): StatusModel
    {
        return $this->model;
    }
}
