<?php

namespace Solspace\Freeform\Library\DataObjects\Diagnostics\Validators;

use Solspace\Freeform\Library\Helpers\IsolatedTwig;

class AbstractValidator
{
    /** @var callable */
    private $validator;
    private string $heading;
    private string $message;
    private array $extraProperties;
    private ValidatorContext $context;

    public function __construct(callable $validator, string $heading, string $message, array $extraProperties = [])
    {
        $this->validator = $validator;
        $this->heading = $heading;
        $this->message = $message;
        $this->extraProperties = $extraProperties;

        $this->context = new ValidatorContext();
    }

    public function validate($value): bool
    {
        return \call_user_func($this->validator, $value, $this->context);
    }

    public function getHeading(): string
    {
        return $this->heading;
    }

    public function getMessage(): string
    {
        $context = $this->context->jsonSerialize();

        return (new IsolatedTwig())->render($this->message, $context);
    }

    public function getExtraProperties(): array
    {
        return $this->extraProperties;
    }
}
