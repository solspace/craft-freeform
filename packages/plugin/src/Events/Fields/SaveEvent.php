<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Models\FieldModel;

class SaveEvent extends CancelableArrayableEvent
{
    /** @var FieldModel */
    private $model;

    /** @var bool */
    private $new;

    public function __construct(FieldModel $model, bool $new = false)
    {
        $this->new = $new;
        $this->model = $model;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['model', 'new']);
    }

    public function getModel(): FieldModel
    {
        return $this->model;
    }

    public function isNew(): bool
    {
        return $this->new;
    }
}
