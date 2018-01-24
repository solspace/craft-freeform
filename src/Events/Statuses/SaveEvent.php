<?php

namespace Solspace\Freeform\Events\Statuses;

use craft\events\CancelableEvent;
use Solspace\Freeform\Models\StatusModel;

class SaveEvent extends CancelableEvent
{
    /** @var StatusModel */
    private $model;

    /** @var bool */
    private $new;

    /**
     * @param StatusModel $status
     * @param bool        $new
     */
    public function __construct(StatusModel $status, bool $new)
    {
        $this->model = $status;
        $this->new   = $new;

        parent::__construct();
    }

    /**
     * @return StatusModel
     */
    public function getModel(): StatusModel
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
