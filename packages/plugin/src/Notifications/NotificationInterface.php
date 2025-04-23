<?php

namespace Solspace\Freeform\Notifications;

interface NotificationInterface
{
    public const PREPARE_NOTIFICATION = 'prepare-notification';

    public function getId(): ?int;

    public function getUid(): ?string;

    public function isEnabled(): bool;

    public function getClassName(): string;

    public function getName(): string;
}
