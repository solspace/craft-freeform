<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

class FormIntegration
{
    public string $uid;
    public string $integrationUid;
    public bool $enabled;
    public \stdClass $metadata;
}
