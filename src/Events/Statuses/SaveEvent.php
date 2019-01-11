<?php

namespace Solspace\Freeform\Events\Statuses;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Models\StatusModel;

class SaveEvent extends CancelableArrayableEvent
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
     * @inheritDoc
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['model', 'new']);
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
