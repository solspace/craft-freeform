<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Events;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use yii\base\Event;

class UpdateMetadataEvent extends Event
{
    private array $optionalData = [];

    public function __construct(
        private Form $form,
        private Stripe $integration,
        private array $mandatoryData = []
    ) {
        parent::__construct();
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getIntegration(): Stripe
    {
        return $this->integration;
    }

    public function setData(array $data): self
    {
        $this->optionalData = $data;

        return $this;
    }

    public function addData(string $key, mixed $value): self
    {
        $this->optionalData[$key] = $value;

        return $this;
    }

    public function getCompiledMetadata(): array
    {
        return array_replace_recursive($this->optionalData, $this->mandatoryData);
    }
}
