<?php

namespace Solspace\Freeform\Events\Mailer;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;

class RenderEmailEvent extends ArrayableEvent
{
    public function __construct(
        private Form $form,
        private NotificationTemplate $notification,
        private array $fieldValues,
        private ?Submission $submission = null
    ) {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['form', 'notification', 'fieldValues', 'submission'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getNotification(): NotificationTemplate
    {
        return $this->notification;
    }

    public function getFieldValues(): array
    {
        return $this->fieldValues;
    }

    /**
     * @return null|mixed
     */
    public function getFieldValue(string $key): mixed
    {
        return $this->fieldValues[$key] ?? null;
    }

    public function setFieldValues(array $fieldValues): self
    {
        $this->fieldValues = $fieldValues;

        return $this;
    }

    public function setFieldValue(string $key, mixed $value): self
    {
        $this->fieldValues[$key] = $value;

        return $this;
    }

    public function getSubmission(): ?Submission
    {
        return $this->submission;
    }
}
