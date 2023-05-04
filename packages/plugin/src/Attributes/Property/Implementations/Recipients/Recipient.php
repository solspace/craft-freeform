<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Recipients;

class Recipient
{
    public function __construct(
        private string $email,
        private string $name,
    ) {
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getName(): string
    {
        return $this->name;
    }
}
