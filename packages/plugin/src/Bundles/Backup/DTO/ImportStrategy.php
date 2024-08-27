<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

class ImportStrategy
{
    public const TYPE_REPLACE = 'replace';
    public const TYPE_SKIP = 'skip';

    public string $forms;
    public string $templates;
    public string $integrations;

    public function __construct(array $strategy = [])
    {
        $this->forms = $strategy['forms'] ?? self::TYPE_REPLACE;
        $this->templates = $strategy['templates'] ?? self::TYPE_REPLACE;
        $this->integrations = $strategy['integrations'] ?? self::TYPE_REPLACE;
    }
}
