<?php

namespace Solspace\Freeform\Library\DataObjects;

class ConnectionResult
{
    /** @var array */
    private $formErrors;

    /** @var array */
    private $fieldErrors;

    /**
     * ConnectionResult constructor.
     */
    public function __construct()
    {
        $this->formErrors  = [];
        $this->fieldErrors = [];
    }

    /**
     * @return bool
     */
    public function isSuccessful(): bool
    {
        return empty($this->formErrors) && empty($this->fieldErrors);
    }

    /**
     * @return string
     */
    public function getAllErrorJson(): string
    {
        $conjoinedErrors = [
            'formErrors' => $this->getFormErrors(),
            'fieldErrors' => $this->getFieldErrors(),
        ];

        return json_encode($conjoinedErrors);
    }

    /**
     * @return array
     */
    public function getFormErrors(): array
    {
        return $this->formErrors;
    }

    /**
     * @return array
     */
    public function getFieldErrors(): array
    {
        return $this->fieldErrors;
    }

    /**
     * @param string $message
     *
     * @return $this
     */
    public function addFormError(string $message): ConnectionResult
    {
        $this->formErrors[] = $message;

        return $this;
    }

    /**
     * @param array $errors
     *
     * @return $this
     */
    public function addFormErrors(array $errors): ConnectionResult
    {
        foreach ($errors as $error) {
            $this->formErrors[] = $error;
        }

        return $this;
    }

    /**
     * @param string $fieldName
     * @param string $message
     *
     * @return ConnectionResult
     */
    public function addFieldError(string $fieldName, string $message): ConnectionResult
    {
        if (!isset($this->fieldErrors[$fieldName])) {
            $this->fieldErrors[$fieldName] = [];
        }

        $this->fieldErrors[$fieldName][] = $message;

        return $this;
    }

    /**
     * @param array $errors
     *
     * @return ConnectionResult
     */
    public function addFieldErrors(array $errors): ConnectionResult
    {
        foreach ($errors as $key => $message) {
            $this->addFieldError($key, $message);
        }

        return $this;
    }
}
