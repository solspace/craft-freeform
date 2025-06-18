<?php

namespace Solspace\Freeform\Events\Mailer;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;

class RenderEmailEvent extends ArrayableEvent
{
    private array $fieldValues = [];

    public function __construct(
        private Form $form,
        private NotificationTemplate $notification,
        private array $twigVariables,
        private ?Submission $submission = null
    ) {
        $this->fieldValues = $this->twigVariables;

        parent::__construct();
    }

    public function fields(): array
    {
        return ['form', 'notification', 'fieldValues', 'twigVariables', 'submission'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getNotification(): NotificationTemplate
    {
        return $this->notification;
    }

    public function getSubmission(): ?Submission
    {
        return $this->submission;
    }

    public function getTwigVariables(): array
    {
        return $this->twigVariables;
    }

    public function getTwigVariable(string $key): mixed
    {
        return $this->twigVariables[$key] ?? null;
    }

    public function setTwigVariables(array $variables): self
    {
        $this->twigVariables = $variables;

        return $this;
    }

    public function setTwigVariable(string $key, mixed $value): self
    {
        $this->twigVariables[$key] = $value;

        return $this;
    }

    /**
     * @deprecated in v5.11.0. Use ::getTwigVariables() instead.
     */
    public function getFieldValues(): array
    {
        return $this->getTwigVariables();
    }

    /**
     * @deprecated in v5.11.0. Use ::getTwigVariable() instead.
     */
    public function getFieldValue(string $key): mixed
    {
        return $this->getTwigVariable($key);
    }

    /**
     * @deprecated in v5.11.0. Use ::setTwigVariables() instead.
     */
    public function setFieldValues(array $fieldValues): self
    {
        $this->fieldValues = $fieldValues;

        return $this->setTwigVariables($fieldValues);
    }

    /**
     * @deprecated in v5.11.0. Use ::setTwigVariable() instead.
     */
    public function setFieldValue(string $key, mixed $value): self
    {
        $this->fieldValues[$key] = $value;

        return $this->setTwigVariable($key, $value);
    }

    public function get(string $key): mixed
    {
        return $this->getTwigVariable($key);
    }

    public function add(string $key, mixed $value): self
    {
        $this->setTwigVariable($key, $value);

        return $this;
    }

    public function addBatch(array $values): self
    {
        foreach ($values as $key => $value) {
            $this->add($key, $value);
        }

        return $this;
    }
}
