<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

class NotificationTemplate
{
    public null|int|string $originalId = null;
    public string $name;
    public string $handle;
    public ?string $description = null;

    public string $fromEmail;
    public string $fromName;
    public ?string $replyToName = null;
    public ?string $replyToEmail = null;
    public ?array $cc = null;
    public ?array $bcc = null;

    public bool $includeAttachments = false;
    public ?array $presetAssets = null;

    public string $subject;
    public string $body;
    public string $textBody;
    public bool $autoText;
}
