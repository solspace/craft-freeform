<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Models\FormModel;

class SaveEvent extends CancelableArrayableEvent
{
    /** @var FormModel */
    private $model;

    /** @var bool */
    private $new;

    public function __construct(FormModel $model, bool $new)
    {
        $this->model = $model;
        $this->new = $new;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['model', 'new']);
    }

    public function getModel(): FormModel
    {
        return $this->model;
    }

    public function isNew(): bool
    {
        return $this->new;
    }
}
