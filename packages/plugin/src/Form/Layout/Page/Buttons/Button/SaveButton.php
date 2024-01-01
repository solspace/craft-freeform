<?php

namespace Solspace\Freeform\Form\Layout\Page\Buttons\Button;

use Solspace\Freeform\Form\Layout\Page\Buttons\Button;

class SaveButton extends Button
{
    private int|string $notificationId;
    private string $emailFieldUid;
    private string $redirectUrl;

    public function __construct(?array $config)
    {
        $this->notificationId = $config['notificationId'] ?? '';
        $this->emailFieldUid = $config['emailFieldUid'] ?? '';
        $this->redirectUrl = $config['redirectUrl'] ?? '';

        parent::__construct($config);
    }

    public function getNotificationId(): int|string
    {
        return $this->notificationId;
    }

    public function getEmailFieldUid(): string
    {
        return $this->emailFieldUid;
    }

    public function getRedirectUrl(): string
    {
        return $this->redirectUrl;
    }
}
