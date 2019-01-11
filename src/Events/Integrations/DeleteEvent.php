<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Models\IntegrationModel;

class DeleteEvent extends CancelableArrayableEvent
{
    /** @var IntegrationModel */
    private $model;

    /**
     * @param IntegrationModel $model
     */
    public function __construct(IntegrationModel $model)
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
     * @return IntegrationModel
     */
    public function getModel(): IntegrationModel
    {
        return $this->model;
    }
}
