<?php

namespace Solspace\Freeform\Events\Mailer;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Mailing\NotificationInterface;

class RenderEmailEvent extends ArrayableEvent
{
    /** @var Form */
    private $form;

    /** @var NotificationInterface */
    private $notification;

    /** @var array */
    private $fieldValues;

    /** @var Submission */
    private $submission;

    public function __construct(
        Form $form,
        NotificationInterface $notification,
        array $fieldValues,
        Submission $submission = null
    ) {
        $this->form = $form;
        $this->notification = $notification;
        $this->fieldValues = $fieldValues;
        $this->submission = $submission;

        parent::__construct([]);
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['form', 'notification', 'fieldValues', 'submission'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getNotification(): NotificationInterface
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
    public function getFieldValue(string $key)
    {
        return $this->fieldValues[$key] ?? null;
    }

    public function setFieldValues(array $fieldValues): self
    {
        $this->fieldValues = $fieldValues;

        return $this;
    }

    /**
     * @param mixed $value
     */
    public function setFieldValue(string $key, $value): self
    {
        $this->fieldValues[$key] = $value;

        return $this;
    }

    public function getSubmission(): Submission
    {
        return $this->submission;
    }
}
