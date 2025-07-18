<?php

namespace Solspace\Freeform\Events\Integrations;

use craft\events\CancelableEvent;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class AuthorizeIntegrationEvent extends CancelableEvent
{
    private array $errors = [];

    public function __construct(private IntegrationInterface $integration)
    {
        parent::__construct();
    }

    public function getIntegration(): IntegrationInterface
    {
        return $this->integration;
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
