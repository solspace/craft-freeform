<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

class ImportStrategy
{
    public const TYPE_REPLACE = 'replace';
    public const TYPE_SKIP = 'skip';

    public string $forms;
    public string $notifications;

    public function __construct(array $strategy = [])
    {
        $this->forms = $strategy['forms'] ?? self::TYPE_REPLACE;
        $this->notifications = $strategy['notifications'] ?? self::TYPE_REPLACE;
    }
}
