<?php

namespace Solspace\Freeform\Events\Forms;

use craft\events\CancelableEvent;
use Solspace\Freeform\Models\FormModel;

class SaveEvent extends CancelableEvent
{
    /** @var FormModel */
    private $model;

    /** @var bool */
    private $new;

    /**
     * @param FormModel $model
     * @param bool      $new
     */
    public function __construct(FormModel $model, bool $new)
    {
        $this->model = $model;
        $this->new   = $new;

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
     * @return bool
     */
    public function isNew(): bool
    {
        return $this->new;
    }
}
