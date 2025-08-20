<?php

namespace Solspace\Freeform\Events\Integrations;

use craft\events\CancelableEvent;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;

class AuthorizeIntegrationEvent extends CancelableEvent
{
    private bool $triggerSave = false;
    private array $errors = [];

    public function __construct(
        private IntegrationModel $model,
        private IntegrationInterface $integration,
    ) {
        parent::__construct();
    }

    public function getModel(): IntegrationModel
    {
        return $this->model;
    }

    public function getIntegration(): IntegrationInterface
    {
        return $this->integration;
    }

    public function isTriggerSave(): bool
    {
        return $this->triggerSave;
    }

    public function setTriggerSave(bool $triggerSave): self
    {
        $this->triggerSave = $triggerSave;

        return $this;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function hasErrors(): bool
    {
        return !empty($this->errors);
    }

    public function addError(string $error): void
    {
        $this->errors[] = $error;
    }

    public function addErrors(array $errors): void
    {
        foreach ($errors as $error) {
            $this->addError($error);
        }
    }
}
