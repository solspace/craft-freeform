<?php

namespace Solspace\Freeform\Library\DataObjects\Diagnostics\Validators;

class AbstractValidator
{
    /** @var callable */
    private $validator;

    /** @var string */
    private $heading;

    /** @var string */
    private $message;

    /** @var array */
    private $extraProperties;

    public function __construct(callable $validator, string $heading, string $message, array $extraProperties = [])
    {
        $this->validator = $validator;
        $this->heading = $heading;
        $this->message = $message;
        $this->extraProperties = $extraProperties;
    }

    public function validate($value): bool
    {
        return \call_user_func($this->validator, $value);
    }

    public function getHeading(): string
    {
        return $this->heading;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    public function getExtraProperties(): array
    {
        return $this->extraProperties;
    }
}
