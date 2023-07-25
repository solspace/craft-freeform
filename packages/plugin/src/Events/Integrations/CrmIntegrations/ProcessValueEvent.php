<?php

namespace Solspace\Freeform\Events\Integrations\CrmIntegrations;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Fields\FieldInterface as FreeformFieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class ProcessValueEvent extends CancelableArrayableEvent
{
    public function __construct(
        private IntegrationInterface $integration,
        private Form $form,
        private FieldObject $integrationField,
        private ?FreeformFieldInterface $freeformField,
        private mixed $value,
    ) {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['integration', 'form', 'integrationField', 'freeformField', 'value'];
    }

    public function getIntegration(): IntegrationInterface
    {
        return $this->integration;
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getIntegrationField(): FieldObject
    {
        return $this->integrationField;
    }

    public function getFreeformField(): ?FreeformFieldInterface
    {
        return $this->freeformField;
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
