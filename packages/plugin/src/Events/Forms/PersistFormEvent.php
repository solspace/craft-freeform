<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormNotificationRecord;
use Solspace\Freeform\Records\Form\FormPageRecord;
use yii\base\Event;

class PersistFormEvent extends Event
{
    private array $responseData = [];

    private ?int $status = null;

    private ?Form $form = null;

    /** @var FormFieldRecord[] */
    private array $fieldRecords = [];

    /** @var FormPageRecord[] */
    private array $pageRecords = [];

    /**
     * @var FormNotificationRecord[]
     */
    private array $notificationRecords = [];

    public function __construct(
        private \stdClass $payload,
        private ?int $formId = null
    ) {
        parent::__construct([]);
    }

    public function getForm(): ?Form
    {
        return $this->form;
    }

    public function setForm(?Form $form): self
    {
        $this->form = $form;

        return $this;
    }

    public function addFieldRecord(FormFieldRecord $fieldRecord): self
    {
        $this->fieldRecords[] = $fieldRecord;

        return $this;
    }

    public function getFieldRecord(string $uid): ?FormFieldRecord
    {
        foreach ($this->fieldRecords as $fieldRecord) {
            if ($fieldRecord->uid === $uid) {
                return $fieldRecord;
            }
        }

        return null;
    }

    public function addPageRecord(FormPageRecord $pageRecord): self
    {
        $this->pageRecords[] = $pageRecord;

        return $this;
    }

    public function getPageRecord(string $uid): ?FormPageRecord
    {
        foreach ($this->pageRecords as $pageRecord) {
            if ($pageRecord->uid === $uid) {
                return $pageRecord;
            }
        }

        return null;
    }

    public function addNotificationRecord(FormNotificationRecord $notificationRecord): self
    {
        $this->notificationRecords[] = $notificationRecord;

        return $this;
    }

    public function getNotificationRecord(string $uid): ?FormNotificationRecord
    {
        foreach ($this->notificationRecords as $notificationRecord) {
            if ($notificationRecord->uid === $uid) {
                return $notificationRecord;
            }
        }

        return null;
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

    public function hasErrors(): bool
    {
        if (!isset($this->responseData['errors'])) {
            return false;
        }

        foreach ($this->responseData['errors'] as $key => $errors) {
            if (\count($errors) > 0) {
                return true;
            }
        }

        return false;
    }

    public function getErrorsFor(string $key): array
    {
        return $this->responseData['errors'][$key] ?? [];
    }

    public function addErrorsToResponse(string $key, array $errors): self
    {
        if (empty($errors)) {
            return $this;
        }

        $errorList = $this->responseData['errors'] ?? [];

        $errorList[$key] = array_merge_recursive(
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
