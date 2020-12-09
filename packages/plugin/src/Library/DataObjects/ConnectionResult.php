<?php

namespace Solspace\Freeform\Library\DataObjects;

use craft\base\ElementInterface;

class ConnectionResult
{
    /** @var ElementInterface */
    private $element;

    /** @var array */
    private $formErrors;

    /** @var array */
    private $fieldErrors;

    /**
     * ConnectionResult constructor.
     */
    public function __construct()
    {
        $this->element = null;
        $this->formErrors = [];
        $this->fieldErrors = [];
    }

    public function isSuccessful(): bool
    {
        return empty($this->formErrors) && empty($this->fieldErrors);
    }

    public function getAllErrorJson(): string
    {
        $conjoinedErrors = [
            'formErrors' => $this->getFormErrors(),
            'fieldErrors' => $this->getFieldErrors(),
        ];

        return json_encode($conjoinedErrors);
    }

    public function getFormErrors(): array
    {
        return $this->formErrors;
    }

    public function getFieldErrors(): array
    {
        return $this->fieldErrors;
    }

    /**
     * @return $this
     */
    public function addFormError(string $message): self
    {
        $this->formErrors[] = $message;

        return $this;
    }

    /**
     * @return $this
     */
    public function addFormErrors(array $errors): self
    {
        foreach ($errors as $error) {
            $this->formErrors[] = $error;
        }

        return $this;
    }

    public function addFieldError(string $fieldName, string $message): self
    {
        if (!isset($this->fieldErrors[$fieldName])) {
            $this->fieldErrors[$fieldName] = [];
        }

        $this->fieldErrors[$fieldName][] = $message;

        return $this;
    }

    public function addFieldErrors(array $errors): self
    {
        foreach ($errors as $key => $message) {
            $this->addFieldError($key, $message);
        }

        return $this;
    }
}
