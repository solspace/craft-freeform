<?php

namespace Solspace\Freeform\Notifications\Components\Recipients;

class Recipient
{
    // A declaration default also applies to recipients serialized before this flag existed.
    private bool $isTemplate = false;

    public function __construct(
        private string $email,
        private string $name = '',
        bool $isTemplate = false,
    ) {
        $this->isTemplate = $isTemplate;
    }

    public function isTemplate(): bool
    {
        return $this->isTemplate;
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
