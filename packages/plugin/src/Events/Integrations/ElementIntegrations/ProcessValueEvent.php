<?php

namespace Solspace\Freeform\Events\Integrations\ElementIntegrations;

use craft\base\FieldInterface as CraftFieldInterface;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Fields\FieldInterface as FreeformFieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class ProcessValueEvent extends CancelableArrayableEvent
{
    public function __construct(
        private IntegrationInterface $integration,
        private Form $form,
        private ?CraftFieldInterface $craftField,
        private ?FreeformFieldInterface $freeformField,
        private string $handle,
        private mixed $value,
    ) {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['integration', 'form', 'craftField', 'freeformField', 'handle', 'value'];
    }

    public function getIntegration(): IntegrationInterface
    {
        return $this->integration;
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getCraftField(): ?CraftFieldInterface
    {
        return $this->craftField;
    }

    public function getFreeformField(): ?FreeformFieldInterface
    {
        return $this->freeformField;
    }

    public function getHandle(): string
    {
        return $this->handle;
    }

    public function getValue(): mixed
    {
        return $this->value;
    }

    public function setValue(mixed $value): self
    {
        $this->value = $value;

        return $this;
    }
}
