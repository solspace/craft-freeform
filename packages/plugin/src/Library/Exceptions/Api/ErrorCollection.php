<?php

namespace Solspace\Freeform\Library\Exceptions\Api;

class ErrorCollection
{
    private array $errors = [];

    public function add(string $category, string $target, array $messages): self
    {
        $this->errors[$category][$target] = [...$messages];

        return $this;
    }

    public function asArray(): array
    {
        return $this->errors;
    }
}
