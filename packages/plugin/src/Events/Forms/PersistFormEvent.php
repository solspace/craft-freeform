<?php

namespace Solspace\Freeform\Events\Forms;

use yii\base\Event;

class PersistFormEvent extends Event
{
    private array $responseData = [];

    public function __construct(
        private \stdClass $payload,
        private ?int $formId = null
    ) {
        parent::__construct([]);
    }

    public function getPayload(): \stdClass
    {
        return $this->payload;
    }

    public function getFormId(): ?int
    {
        return $this->formId;
    }

    public function getResponseData(): array
    {
        return $this->responseData;
    }

    public function setResponseData(array $responseData): self
    {
        $this->responseData = $responseData;

        return $this;
    }

    public function addToResponse(string $key, mixed $value): self
    {
        $this->responseData[$key] = $value;

        return $this;
    }

    public function removeFromResponse(string $key): self
    {
        unset($this->responseData[$key]);

        return $this;
    }
}
