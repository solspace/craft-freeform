<?php

namespace Solspace\Freeform\Events\Integrations;

use craft\events\CancelableEvent;
use Solspace\Freeform\Models\IntegrationModel;

class DeleteEvent extends CancelableEvent
{
    /** @var IntegrationModel */
    public $model;

    /**
     * @param IntegrationModel $model
     */
    public function __construct(IntegrationModel $model)
    {
        $this->model = $model;

        parent::__construct();
    }

    /**
     * @return IntegrationModel
     */
    public function getModel(): IntegrationModel
    {
        return $this->model;
    }
}
