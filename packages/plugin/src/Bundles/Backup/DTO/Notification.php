<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

class Notification
{
    public string $id;
    public string $uid;
    public bool $enabled = true;
    public string $idAttribute;
    public string $name;
    public string $type;
    public array $metadata = [];
}
