<?php

namespace Solspace\Freeform\Events\Forms;

use yii\base\Event;

class PersistFormEvent extends Event
{
    private array $responseData = [];

    private ?int $status = null;

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

    public function addErrorsToResponse(string $key, array $errors): self
    {
        if (empty($errors)) {
            return $this;
        }

        $errorList = $this->responseData['errors'] ?? [];

        $errorList[$key] = array_merge(
            $errorList[$key] ?? [],
            $errors
        );

        $this->responseData['errors'] = $errorList;
        $this->status = 400;

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

    public function getStatus(): ?int
    {
        return $this->status;
    }

    public function setStatus(int $status): self
    {
        $this->status = $status;

        return $this;
    }
}
