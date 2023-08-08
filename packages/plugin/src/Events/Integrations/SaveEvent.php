<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;

class SaveEvent extends CancelableArrayableEvent
{
    public function __construct(
        private IntegrationModel $model,
        private IntegrationInterface $integration,
        private bool $new
    ) {
        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['model', 'integration', 'new']);
    }

    public function getModel(): IntegrationModel
    {
        return $this->model;
    }

    public function getIntegration(): IntegrationInterface
    {
        return $this->integration;
    }

    public function isNew(): bool
    {
        return $this->new;
    }
}
