<?php

namespace Solspace\Freeform\Notifications\Components\Recipients;

class Recipient
{
    public function __construct(
        private string $email,
        private string $name = '',
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
