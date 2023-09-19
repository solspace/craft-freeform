<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class PushEvent extends CancelableArrayableEvent
{
    public function __construct(
        private IntegrationInterface $integration,
        private string $category,
        private array $values
    ) {
        parent::__construct();
    }

    public function fields(): array
    {
        return array_merge(
            parent::fields(),
            [
                'integration',
                'category',
                'values',
            ]
        );
    }

    public function getIntegration(): IntegrationInterface
    {
        return $this->integration;
    }

    public function getCategory(): string
    {
        return $this->category;
    }

    public function getValues(): array
    {
        return $this->values;
    }

    public function setValues(array $values = []): self
    {
        $this->values = $values;

        return $this;
    }

    public function addValue(string $key, mixed $value): self
    {
        $this->values[$key] = $value;

        return $this;
    }
}
