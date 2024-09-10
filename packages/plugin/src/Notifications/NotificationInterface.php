<?php

namespace Solspace\Freeform\Notifications;

interface NotificationInterface
{
    public function getId(): ?int;

    public function getUid(): ?string;

    public function isEnabled(): bool;

    public function getClassName(): string;

    public function getName(): string;
}
